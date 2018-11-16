//获取元素
Element.prototype.$ = function(str){
	ment = this || document;
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

//核销模块
Worm = function(options){
	//初始化变量
	var i;

	//一一赋值给原型
	for(i in options.data){this._data[i] = {};this._data[i].value = options.data[i]}
	//删除传过来的值
	delete options.data;

	this._el = options.el || document.body;

	this.$Initialization();
}
Worm.prototype = {
	_el:Element,
	_data:{},
	_prototype:{},
	//替换语句中变量为变量
	$getinitialvalue:function(str){
		var data = [];
		for(var z in this._data){
			var value = str.match(eval("/("+z+")(?=(?:[^\"]|\"[^\"]*\")*$)(?=(?:[^']|'[^']*')*$)/g"));
			if(value && value.length){
				data.push(z);
			}
			str = str.replace(eval("/("+z+")(?=(?:[^\"]|\"[^\"]*\")*$)(?=(?:[^']|'[^']*')*$)/g"),"this._data." + z + ".value");
		}
		return {value:str,variable:data};
	},
	$Initialization:function(){
		var data = {},a;
		
		//初始化动态赋值
		for(i in this._data){
			(function(i){
				console.log(i);
				data[i] = {
					get:function(){
						
						return this._data[i].value;
					},
					set:function(value){
						this._data[i].value = value;
						for(a = 0;a<this._data[i].el.length;a++){
							this._data[i].el[a][this._data[i].type[a]] = eval(this._data[i].bindvalue[a]);
						}
						
					}
				}
			})(i)
		}
		Object.defineProperties(this,data)

		console.log(this._el);
		//初始化动态数据
		this._el.innerHTML = this._el.innerHTML.replace(/\{\{+(.+?)\}\}/g,"<w-worm>$1</w-worm>");

		var el = this._el.$("w-worm");
		for(var i=0;i<el.length;i++){
			var bindvalue = this.$getinitialvalue(el[i].innerHTML);
			el[i].innerHTML = eval(bindvalue.value);
			
			for(a = 0;a<bindvalue.variable.length;a++){
				if(!this._data[bindvalue.variable[a]].el)this._data[bindvalue.variable[a]].el = [];
				if(!this._data[bindvalue.variable[a]].type)this._data[bindvalue.variable[a]].type = [];
				if(!this._data[bindvalue.variable[a]].bindvalue)this._data[bindvalue.variable[a]].bindvalue = [];

				this._data[bindvalue.variable[a]].el.push(el[i]);
				this._data[bindvalue.variable[a]].type.push('innerText');
				this._data[bindvalue.variable[a]].bindvalue.push(bindvalue.value);
			}

		}


	}
}