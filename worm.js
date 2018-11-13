var Worm = function(options){
	for(var i in options.data){
		this[i] = options.data[i];
	}
	this.Initialization(options);

};
Worm.prototype = {
	_datas:[],
	_fors:[],
	first:false,
	Transference:document.createElement("w-worm"),
	onload:function(){},
	update:function(){},
	Initialization:function(options){
		this.$el = this.el || document.body;
		this.$data = options.data || {};
		delete this.el;
		//删除多余的变量
		delete options.data;
		var that = this;
		//getinitialvalue
		function getinitialvalue(str){
			console.log("开始：",str);
			for(z in that.$data){
				console.log(z,str.match(eval("/[^\'](."+z+"?)[^\']/g")));
				//str = str.replace(eval("/[^\'](."+z+"?)[^\']/g"),"this." + z);
			}
			return str;
		}
		//getkey
		function getkey(key){
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
		}
		//html初始化
		//初始化动态数据
		this.$el.innerHTML = this.$el.innerHTML.replace(/\{\{+(.+?)\}\}/g,"<w-worm>$1</w-worm>");
		
		var el = this.$("w-worm");
		for(var i=0;i<el.length;i++){
			el[i].innerHTML = getinitialvalue(el[i].innerHTML);

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
						var key = getkey(attrs[t].name);
						switch(key){
						case "for":
							//var attrs[t].value.split(',');
							this._fors.push({
								initialvalue: attrs[t].value,
								key:key,
								el:element[i],
								lastvalue:null
							});
							var parentNode = element[i].parentNode;
							parentNode.insertBefore(element[i].cloneNode(),element[i]);
							parentNode.removeChild(element[i]);
							element[i].removeAttribute(attrs[t].name);
							break;
						default:
							attrs[t].value = getinitialvalue(attrs[t].value);
							console.log(attrs[t].value);
							this._datas.push({
								initialvalue: attrs[t].value,
								key:key,
								el:element[i],
								lastvalue:null
							});
							element[i].removeAttribute(attrs[t].name);
							break;
						}

					}
				}
			}
		}	
		//初始化完成后更新一次数据
		this.refresh();
		setInterval(function(){
			that.refresh();
		},10);

		//初始化完成后
		this.onload();
	},
	//更新数据
	refresh:function(){
		for(var i=0;i<this._datas.length;i++){
			this.$value = eval(this._datas[i].initialvalue);
			//判断是否不执行
			if(this._datas[i].lastvalue == this.$value){
				if(this._datas[i].key == "model" && this._datas[i].el.value != this.$value){
					eval(this._datas[i].initialvalue) = this._datas[i].el.value;
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
	},
	//获取元素
	$:function(str){
		var name = str.substr(1,str.length);
		switch(str.substr(0,1)){
		case "#":
			return document.getElementById(name);
		case ".":
			return document.getElementsByClassName(name);
		default:
			name = str.substr(0,str.length);
			return document.getElementsByTagName(name);
		}
	}

};