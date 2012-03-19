/*
Reference implementation of WebIDL

Code (c) Marcos Caceres, 2011
Distributed under a WTFP License: http://en.wikipedia.org/wiki/WTFPL

This document reproduces parts of the WebIDL specification as comments. The copyright for
that is held by the W3C.  
*/


(function (){
	"use strict"; 
	
		/*
		As soon as any ECMAScript global environment is created, the following steps must be performed:
		*/
		//Let F be a function object whose behavior when invoked is as follows:
		var F = function(){
			
			//If the this value is undefined, return "[object Undefined]".
			if(this === undefined){
				return "[object Undefined]"; 
			}
			//If the this value is null, return "[object Null]"
			if(this === null){
				return "[object Null]"; 
			}
			
			//	Let O be the result of calling ToObject passing the this value as the argument.
			var O = ECMAScript.ToObject(this); 
			
			//Let class be a string whose value is determined as follows:
			var classType = getClassType(o) 
			//If O is a platform object, interface prototype object or exception interface prototype object, then class is O’s class string.
		}		
		
	
	
	
		Otherwise, class is the value of the [[Class]] internal property of O.
		Return the String value that is the result of concatenating the three Strings "[object ", class, and "]".
		Let P be the Object.prototype object.
		Call the [[DefineOwnProperty]] internal method on P with property name “toString”, descriptor { [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true, [[Value]]: F } and Boolean flag false.
		*/
		
		function getClassType(O){
			var oType = ECMAScript.Type(O)
			var classType;
			//check platform object
			if(ECMAScript.Type(O) === "Function"){
				var name = O.name; 
				var nativeString = "function " + name + "() { [native code] }"; 
				if(O.toString() === nativeString){
					classType = "platform object"; 
					return classType; 
				}
			}
			
			if(O.hasOwnProperty("prototype")){
				/*
				  Interface prototype object
				  The interface object for a non-callback interface must also have a property named “prototype” with attributes
				  { [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: false } 
				  whose value is an object called the interface prototype object.
				*/
				if( oType === "Object"){
					var protoProps = Object.getOwnPropertyDescriptor(O,"prototype"); 
					if(protoProps.writable === false && protoProps.enumerable: false && protoProps.configurable && false){
						classType = "interface prototype object"; 
						return classType; 
					}
				}
			}
			
		}
/*
		3.10. Types
		http://dev.w3.org/2006/webapi/WebIDL/#idl-types
*/


		//The following types are known as integer types: byte, octet, short, unsigned short, long, unsigned long, long long and unsigned long long.
		var integerTypes = []; 

		//primitive types: boolean, the integer types, float, unresticted float, double and unrestricted double.
		var primitiveTypes = []; 

/*
		4. ECMAScript binding
		http://dev.w3.org/2006/webapi/WebIDL/#ecmascript-binding
*/

		//Unless otherwise specified, the [[Extensible]] internal property of objects defined in this section has the value true.
		var extensible = true; 

		//Unless otherwise specified, the [[Prototype]] internal property of objects defined in this section is the Object prototype object.

		var defaultProto = new Object(); 
	
	
		function convertAny(ECMAScriptValue){
			/*
			Since the IDL any type is the union of all other IDL types, it can correspond to any ECMAScript value type.
			How to convert an ECMAScript value to an IDL any value depends on the type of the ECMAScript value:
			*/
			var type = ECMAScript.Type(ECMAScriptValue); 
			var idlType; 
			switch(type){		
				//The undefined value
				case("Undefined"):  
					//The IDL value is an object reference to a special object that represents the ECMAScript undefined value.
					idlType = undefined; 
					break;
				case ("Null"): 
					The null value
				The IDL value is the null object? reference.
				A Boolean value
				The IDL value is the boolean value that represents the same truth value.
				A Number value
				The IDL value is that which is obtained by following the rules for converting the Number to an IDL double value, as described in section 4.2.14, below.
				A String value
				The IDL value is that which is obtained by following the rules for converting the String to an IDL DOMString value, as described in section 4.2.16, below.
				An object value
				The IDL value is an object value that references the same object.
				An IDL any value is converted to an ECMAScript value as follows. If the value is an object reference to a special object that represents an ECMAScript undefined value, then it is converted to the ECMAScript undefined value. Otherwise, the rules for converting the specific type of the IDL any value as described in the remainder of this section are performed.
			*/
			
		}
	
	
	
})();