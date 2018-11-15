	//insert For
	insertfor = function(el,data,that){
		var element = el.children;
		for(i = 0;i< element.length;i++){

			if(element[i].attributes && element[i].attributes.length > 0){
				var attrs = element[i].attributes;  //得到所有属性
				for(var t=0;t<attrs.length;t++){
					var bs = attrs[t].name.substr(0,2);
					if(bs == "w-" || bs.substr(0,1) == ":"){
						var key = that.$getkey(attrs[t].name);
						if(key == "for"){
	
							var key = that.$getkey(attrs[t].name),
							expression = attrs[t].value.replace(/(^\s*)|(\s*$)/g,"").replace("  "," ").split(" "),
							parameter = expression[0].replace(" ","").split(","),
							parent = element[i].parentNode,
							index = 0,
							lastel = element[i],
							originaldata = element[i].innerHTML,
							fordata = {
								item:parameter[0],
								index:parameter.length>1?parameter[1]:null,
								type:expression[1]
							};
					
							try{
								value = eval(expression[2]);
								if(!value){
									thorw;
								}
							}catch(to){
								value = eval("that." + expression[2]);
								if(!value){
									value = expression[2];
								}
							}
							
							var elementData = {
								initialvalue: data || value,
								fordata:fordata,
								key:key,
								value:element[i],
								parentNode:parent,
								lastvalue:null
							}

							that._fors.push(elementData);
							element[i].removeAttribute(attrs[t].name);

							for(f in elementData.initialvalue){
								console.log(value[f],data,elementData.initialvalue);
								if(index > 0){
									lastel = lastel.nextSibling;
									var elementBODY = elementData.value.cloneNode();
									elementBODY.innerHTML = originaldata;
									parent.insertBefore(elementBODY,lastel)
									lastel = elementBODY;
								}else{
									var elementBODY = elementData.value;
								}

								elementBODY.innerHTML = elementBODY.innerHTML.replace(/\{\{+(.+?)\}\}/g,"@@~"+elementData.initialvalue[f]+"@@~");

								//console.log(elementBODY.innerHTML,value[f] + "/" + elementData.fordata.item);
								index++
								new insertfor(elementBODY,elementData.initialvalue[f],that);
							}

						}
					}
				}
			}

		}

	}


var Worm = function(options){
	//初始化this
	for(var i in options.data){
		if(i.substr(0,1) == "$" || i.substr(0,1) == "_"){
			console.error("[Worm] Error 变量 \"" + i + "\" 错误,Date中初始化的变量不能以 $ 和 _ 开头！");
			return false;
		}
		this[i] = options.data[i];
	}
	this.$Initialization(options);

};
Worm.prototype = {
	_datas:[],
	_fors:[],
	$time:10,
	$backstage:true,
	$transference:document.createElement("w-worm"),
	onload:null,
	update:null,
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
	$Initialization:function(options){
		this.$el = this.el || document.body;
		this.$data = options.data || {};
		delete this.el;
		//删除多余的变量
		delete options.data;
		var that = this;

		//渲染for
		new insertfor(this.$el,null,this);

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
		element = document.getElementsByTagName("*");
		for(i = 0;i< element.length;i++){
			if(element[i].attributes && element[i].attributes.length > 0){
				attrs = element[i].attributes;  //得到所有属性
				for(t=0;t<attrs.length;t++){
					bs = attrs[t].name.substr(0,2);
					if(bs == "w-" || bs.substr(0,1) == ":"){
						key = this.$getkey(attrs[t].name);
						switch(key){
						case "for":
							break;
						default:
							if(!attrs.getNamedItem("w-for") && !attrs.getNamedItem(":for")){
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
			});
			//窗口退出暂停
			window.addEventListener("blur",function(){
				clearTimeout(that.$timer);
			});
		}

		//初始化完成后
		this.onload && this.onload();
	},
	//更新数据
	$refresh:function(){
		var that = this;
		//渲染for类型
		for(var i=0;i<this._fors.length;i++){

		}

		//渲染元素属性
		for(i=0;i<this._datas.length;i++){
			if(this._datas[i].el.parentNode){

				this.$value = eval(this._datas[i].initialvalue);
				//判断是否不执行
				if(this._datas[i].lastvalue == this.$value){
					if(this._datas[i].key == "model" && this._datas[i].el.value != this.$value){
						eval(this._datas[i].initialvalue + "= this._datas[i].el.value");
						this._datas[i].lastvalue = this._datas[i].el.value;
					}
				}else{
					this.update && this.update(this._datas[i]);
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

			}else{
				this._datas.splice(i,1);
				i--;
			}
		}
		delete this.$value;

		this.$timer = setTimeout(function(){
			that.$refresh();
		},this.$time);
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