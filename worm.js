var Worm = function(options){
	//初始化this
	for(var i in options.data){
		this[i] = options.data[i];
	}
	this.$Initialization(options);

};
Worm.prototype = {
	_datas:[],
	_fors:[],
	$backstage:true,
	$transference:document.createElement("w-worm"),
	onload:function(){},
	update:function(){},
	//getkey
	$getkey:function(key){
		var bs = key.substr(0,1),keys = {$html:"innerHTML",$class:"className"};
		switch(bs){
		case "w":
			key = key.substr(2,key.length);
			break;
		case ":":
			key = key.substr(1,key.length);
			break;
		}
		return keys["$" + key] || key;
	},
	//getinitialvalue
	$getinitialvalue:function(str){
		for(var z in this.$data){
			str = str.replace(eval("/("+z+")(?=(?:[^\"]|\"[^\"]*\")*$)(?=(?:[^']|'[^']*')*$)/g"),"this." + z);
		}
		return str;
	},
	//insert For
	$insertfor:function(el,value,key,name){
		var expression = value.replace(/(^\s*)|(\s*$)/g,"").replace("  "," ").split(" ");
		var parameter = expression[0].replace(" ","").split(",");
		
		var fordata = {
			item:parameter[0],
			index:parameter.length>1?parameter[1]:null,
			type:expression[1]
		};

		var $transference = this.$transference.cloneNode();
		this._fors.push({
			initialvalue: this.$getinitialvalue(expression[2]),
			fordata:fordata,
			key:key,
			el:$transference,
			value:el,
			lastvalue:null
		});
		var parentNode = el.parentNode;
		el.removeAttribute(name);
		parentNode.replaceChild($transference,el);
	},
	$Initialization:function(options){
		this.$el = this.el || document.body;
		this.$data = options.data || {};
		delete this.el;
		//删除多余的变量
		delete options.data;
		var that = this;

		//html初始化
		//初始化动态数据
		this.$el.innerHTML = this.$el.innerHTML.replace(/\{\{+(.+?)\}\}/g,"<w-worm>$1</w-worm>");
		
		var el = this.$("w-worm");
		for(var i=0;i<el.length;i++){
			el[i].innerHTML = this.$getinitialvalue(el[i].innerHTML);

			this._datas.push({
				initialvalue:el[i].innerHTML,
				key:"innerText",
				el:el[i],
				lastvalue:null
			});
		}
		//属性值初始化
		var element = document.getElementsByTagName("*");
		for(i = 0;i< element.length;i++){
			if(element[i].attributes && element[i].attributes.length > 0){
				var attrs = element[i].attributes;  //得到所有属性
				for(var t=0;t<attrs.length;t++){
					var bs = attrs[t].name.substr(0,2);
					if(bs == "w-" || bs.substr(0,1) == ":"){
						var key = this.$getkey(attrs[t].name);
						switch(key){
						case "for":
							this.$insertfor(element[i],attrs[t].value,key,attrs[t].name);
							break;
						default:
							if(!attrs.getNamedItem('w-for') && !attrs.getNamedItem(':for')){
								attrs[t].value = this.$getinitialvalue(attrs[t].value);
								this._datas.push({
									initialvalue: attrs[t].value,
									key:key,
									el:element[i],
									lastvalue:null
								});
								element[i].removeAttribute(attrs[t].name);
							}
							break;
						}

					}
				}
			}
		}	
		//初始化完成后更新一次数据
		this.$refresh();

		if(this.$backstage && window.addEventListener){
			//窗口进入刷新
			window.addEventListener("focus",function(){
				that.$refresh();
			})
			//窗口退出暂停
			window.addEventListener("blur",function(){
				clearTimeout(that.$timer);
			})
		}

		//初始化完成后
		this.onload();
	},
	//更新数据
	$refresh:function(){
		var that = this;
		//渲染for类型
		for(var i=0;i<this._fors.length;i++){
			this.$value = eval(this._fors[i].initialvalue);
			//判断是否不执行
			if(this._fors[i].lastvalue != this.$value){
				this.update(this._fors[i]);
				console.log(this._fors[i]);
				
				var elements = this._fors[i].el.children;
				console.log(elements);
				while (elements.length) {
					console.log(elements);
				}
				if(elements.attributes && elements.attributes.length > 0){
					var attrs = elements.attributes;  //得到所有属性
					for(var t=0;t<attrs.length;t++){
						var bs = attrs[t].name.substr(0,2);
						if(bs == "w-" || bs.substr(0,1) == ":"){
							console.log(attrs);
						}
					}
				}
				
				eval("for(item " + this._fors[i].fordata.type + ' this.$value){this._fors[i].el.appendChild(this._fors[i].value.cloneNode(true))}')
				//this.$insertfor(element[i],attrs[t].value,key,attrs[t].name);

				this._fors[i].lastvalue = this.$value;
			}
		}
		//渲染元素属性
		for(var i=0;i<this._datas.length;i++){
			this.$value = eval(this._datas[i].initialvalue);
			//判断是否不执行
			if(this._datas[i].lastvalue == this.$value){
				if(this._datas[i].key == "model" && this._datas[i].el.value != this.$value){
					eval(this._datas[i].initialvalue + "= this._datas[i].el.value");
					this._datas[i].lastvalue = this._datas[i].el.value;
				}
			}else{
				this.update(this._datas[i]);
				switch(this._datas[i].key){
				case "model":
					this._datas[i].lastvalue = this.$value;
					this._datas[i].el.value = this.$value;
					break;
				default:
					this._datas[i].el[this._datas[i].key] = this.$value;
					this._datas[i].lastvalue = this.$value;
					break;
				}
			}
		}
		delete this.$value;

		this.$timer = setTimeout(function(){
			that.$refresh();
		},10);
	},
	//获取元素
	$:function(str,ment){
		ment = ment || document;
		var name = str.substr(1,str.length);
		switch(str.substr(0,1)){
		case "#":
			return ment.getElementById(name);
		case ".":
			return ment.getElementsByClassName(name);
		default:
			name = str.substr(0,str.length);
			return ment.getElementsByTagName(name);
		}
	}

};