/*
Reference implementation of WebIDL

Code (c) Marcos Caceres, 2011
Distributed under a WTFP License: http://en.wikipedia.org/wiki/WTFPL

This document reproduces parts of the WebIDL specification as comments. The copyright for
that is held by the W3C: http://www.w3.org/Consortium/Legal/2002/copyright-documents-20021231
*/
(function () {
    //Some aspects of WebIDL can only be implemented when not running in String Mode!
    var WebIDL = Object.create(ECMAScript);
    ECMAScript.DefineOwnProperty(window, "WebIDL", {
        value: WebIDL
    })
<<<<<<< HEAD
    
	var publicFunctions = [implement, ExceptionFactory];
=======
    var publicFunctions = [implement, test, ExceptionFactory];
>>>>>>> Fixed a number of bugs, rewrote much of the Exception code
    //Expose functions
    for (var i = 0; i < publicFunctions.length; i++) {
        var func = publicFunctions[i];
        var props = WebIDL.createDataProperty(func);
        WebIDL.DefineOwnProperty(WebIDL, func.name, props, false);
    }
<<<<<<< HEAD

	function implement(parsedIDL){
		if(!parsedIDL || typeof parsedIDL !== "object" || !parsedIDL instanceof Array  ){
			throw new TypeError("Expected an array of objects to process");
		}
		//Parsed IDL comes in an array form
		for(var i = 0; i < parsedIDL.length; i++ ){
			var idlFragment = parsedIDL[i]; 
			if(!idlFragment.type){
				console.warm("Can't process fragment without type:", idlFragment);
				throw new Error("Can't process fragment without type:" + idlFragment + ". See console."); 
			}
			
			switch(idlFragment.type){
				case("exception"): {
					console.log("got an exception", idlFragment ); 
					var identifier   = idlFragment.name || idlFragment.identifier; 
					var extAttrs     = (idlFragment.extAttrs) ? idlFragment.extAttrs : []; 
					var members      = idlFragment.members;  
					
					ExceptionFactory(identifier, extAttrs, message, members, exceptionFields, parent); 
					
					
				}//exception
				
			}
			
		}
	    
	}

=======
    //function tests conformance of 
    function test(obj, parsedIDL) {}

    function implement(parsedIDL) {
        //returns hooks that can be used by other objects
        var impHooks = [];
        if (!parsedIDL || typeof parsedIDL !== "object" || !parsedIDL instanceof Array) {
            throw new TypeError("Expected an array of objects to process");
        }
        //Parsed IDL comes in an array form
        for (var i = 0; i < parsedIDL.length; i++) {
            var idlFragment = parsedIDL[i];
            if (!idlFragment.type) {
                console.warm("Can't process fragment without type:", idlFragment);
                throw new Error("Can't process fragment without type:" + idlFragment + ". See console.");
            }
            switch (idlFragment.type) {
            case ("exception"):
                {
                    console.log("got an exception", idlFragment);
                    var identifier = idlFragment.name || idlFragment.identifier;
                    var extAttrs = (idlFragment.extAttrs) ? idlFragment.extAttrs : [];
                    var eMembers = idlFragment.members;
                    //TODO: Waiting for WebIDL Parser to support extensions
                    var parent = undefined;
                    var exception = ExceptionFactory(identifier, extAttrs, eMembers, parent);
                    impHooks.push(exception);
                } //exception case
            }
        }
    }
>>>>>>> Fixed a number of bugs, rewrote much of the Exception code
    //Exceptions container
    //Used to contain exception prototypes
    var exceptionPrototypes = {}
    /*
	As soon as any ECMAScript global environment is created, the following steps must be performed:
	*/
    //Let F be a function object whose behavior when invoked is as follows:
    var F = function () {
            "use strict";
            //If the this value is undefined, return "[object Undefined]".
            if (this === undefined) {
                return "[object Undefined]";
            }
            //If the this value is null, return "[object Null]"
            if (this === null) {
                return "[object Null]";
            }
            //	Let O be the result of calling ToObject passing the this value as the argument.
            var O = ECMAScript.ToObject(this);
            //Let class be a string whose value is determined as follows:
            var classType = classType(o);
            //If O is a platform object, interface prototype object or exception interface prototype object,
            if (classType === "platform object" || classType === "interface prototype object" || classType === "exception interface prototype") {
                //then class is O’s class string.
                var prop = ECMAScript.createAccessorProperty(function () {
                    return classType
                })
                ECMAScript.DefineOwnProperty(O, "classString", prop);
            }
        }

    function ExceptionFactory(identifier, extendedAttributesList, exceptionMembers, parent) {
        /*There must exist an exception interface prototype object for every exception defined, regardless of whether 
        the exception was declared with the [NoInterfaceObject] extended attribute. The exception interface prototype object 
        for a particular exception has properties that correspond to the constants and exception fields defined on the exception. 
        These properties are described in more detail in sections 4.9.3 and 4.9.4, below.
    	*/
        var exceptionInterfacePrototypeObject;
        /*The exception interface prototype object for a given exception must have an internal [[Prototype]] property whose value is as follows:
		If the exception is declared to inherit from another exception, 
        then the value of the internal [[Prototype]] property is the exception interface 
        prototype object for the inherited exception.
		*/
        if (parent && ECMAScript.Type(parent) === "Object") {
            exceptionInterfacePrototypeObject = Object.create(parent)
        } else {
            //Otherwise, the exception is not declared to inherit from another exception. 
            //The value of the internal [[Prototype]] property is the 
            //Error prototype object ([ECMA-262], section 15.11.3.1).
            exceptionInterfacePrototypeObject = Object.create(new Error())
        }
<<<<<<< HEAD
    }

    function ExceptionFactory(identifier, extendedAttributesList, members, exceptionFields, parent) {
=======
        //TODO: The class string of an exception interface prototype object is the concatenation of the exception’s identifier and the string “Prototype”.
        /*There must be a property named “name” on the exception interface prototype object with attributes 
          { [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true } and whose value is the identifier of the exception.
		*/
        var props = {
            value: identifier,
            writable: true,
            enumerable: false,
            configurable: true
        };
        Object.defineProperty(exceptionInterfacePrototypeObject, "name", props);
        /*
		4.9.1. Exception interface object
		*/
        var exceptionInterfaceObject;
        var code = "exceptionInterfaceObject = function " + identifier + "(){ throw new TypeError('Illegal constructor')}";
        eval(code);
        /*
		If the [NoInterfaceObject] extended attribute was not specified on the exception,
		*/
        if (extendedAttributesList.join().search("NoInterfaceObject") === -1) {
            /*
			 then there must also be a property named “constructor” on the
			 exception interface prototype object with attributes 
			 { [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true } 
			 and whose value is a reference to the exception interface object for the exception.
			 */
            var props = {
                value: exceptionInterfaceObject,
                writable: true,
                enumerable: false,
                configurable: true
            };
            Object.defineProperty(exceptionInterfacePrototypeObject, "constructor", props);
        }
        /*
		 The exception interface object must also have a property named “prototype” with attributes
		 { [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: false } 
	 	 whose value is an object called the exception interface prototype object. 
		 This object also provides access to the constants that are declared on the exception.
		*/
        var props = {
            value: exceptionInterfacePrototypeObject,
            writable: false,
            enumerable: false,
            configurable: false
        };
        Object.defineProperty(exceptionInterfaceObject, "prototype", props);
>>>>>>> Fixed a number of bugs, rewrote much of the Exception code
        /*
		4.9.1.1. Exception interface object [[Call]] method
		The internal [[Call]] method of an exception interface object must behave as follows, 
		assuming arg0..n−1 is the list of argument values passed to the function, 
		and E is the exception corresponding to the exception interface object:
		*/
<<<<<<< HEAD
        var action = function(arg0) {
            //Let O be a new object
            //whose [[Prototype]] internal property is set to
            //the exception interface object
            if (!eInstance) {
                return e;
            }
			//don't ask! :)
			var x = e; 
			e = undefined; 
            var O = new x();
			e = x; 
           // var O = Object.create(e.prototype);

            //and whose class string is the identifier of E.
            //If n > 0, then:
 			var S; 
            if (arguments.length > 0 && arg0 !== undefined) {
                //Let S be the result of calling ToString(arg0).
                S = ECMAScript.ToString(arg0);
			}
            //Call the [[DefineOwnProperty]] internal method of O passing “message”,
           //Property Descriptor { [[Value]]: S, [[Writable]]: true,
           //[[Enumerable]]: false, [[Configurable]]: true }, and false as arguments.
           var prop = {
               value: S,
               writable: true,
               enumerable: false,
               configurable: true
           }
		   //Exceptions have an associated message, a DOMString, 
	       //which is exposed on an exception object in a language binding-specific manner.
           ECMAScript.DefineOwnProperty(O, "message", prop);
	
            //Return O.
            return O;
        }
        /*
		For every exception that is not declared with the [NoInterfaceObject] extended attribute, 
		a corresponding property must exist on the ECMAScript global object. The name of the property 
		is the identifier of the exception, and its value is an object called the exception interface 
		object, which provides access to any constants that have been associated with the exception. 
		The property has the attributes { [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }.
		*/
        var eInstance = null;
        if (extendedAttributesList.join().search("NoInterfaceObject") === -1) {
            var func = "function " + identifier + "(msg){ \n if(e===undefined){\n }else{\n return ECMAScript.Call(action, e, msg)\n } }";
            var props = "{value: " + func + ", writable: true, enumerable: false, configurable: true }"
            var code = "Object.defineProperty(window, '" + identifier + "', " + props + ")";
            eval(code);
            var e = window[identifier];
            eInstance = new e();
        } else {
            var func = "function " + identifier + "(){}";
            var rand = Math.random();
            eval("window[" + rand + "] = " + func);
            var e = window[rand];
            delete window[rand];
            eInstance = new e();
        }
		
		//Exceptions also have an associated type, also a DOMString, which is exposed 
		//on an exception object in a language binding-specific manner. 
	   //The type of an exception is intended to be used to distinguish between the 
	   //different kinds of exceptions that can be represented by the given IDL exception.	
	   //If a type is not specified, 
	   //it is assumed to be the same as the identifier of the exception.
         ECMAScript.DefineOwnProperty(e, "type", {value: identifier});
           
           ECMAScript.DefineOwnProperty(e, "toString", {
               value: function() {
                   return e.type;
               }
           });
		
		//Inheritance
		//If the exception is declared to inherit from another exception, 
		//then the value of the internal [[Prototype]] property is the exception interface 
		//prototype object for the inherited exception.
		
		
		//Otherwise, the exception is not declared to inherit from another exception. 
		//The value of the internal [[Prototype]] property is the 
		//Error prototype object ([ECMA-262], section 15.11.3.1).
		//eInstance.prototype = new Error();
		
		//The exception interface object must also have a property named “prototype” with attributes
		// { [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: false } whose value 
		//is an object called the exception interface prototype object. 
		//This object also provides access to the constants that are declared on the exception.
		Object.defineProperty(e, "prototype", {value: new Error()})
		//Object.defineProperty(e, "prototype", {value: e })
    }
=======
        function exceptionMaker(arg0) {
            //Let O be a new object whose [[Prototype]] internal property is set to the exception interface object
            var O = Object.create(exceptionInterfaceObject);
            //TODO: and whose class string is the identifier of E.
            //If n > 0, then:
            if (arguments.length > 0 && arg0 !== undefined) {
                //Let S be the result of calling ToString(arg0).
                var S = ECMAScript.ToString(arg0);
                //Call the [[DefineOwnProperty]] internal method of O passing “message”,
                //Property Descriptor { [[Value]]: S, [[Writable]]: true,
                //[[Enumerable]]: false, [[Configurable]]: true }, and false as arguments.
                var prop = {
                    value: S,
                    writable: true,
                    enumerable: false,
                    configurable: true
                };
                ECMAScript.DefineOwnProperty(O, "message", prop, true);
            }
            //Return O.
            return O;
        }
        if (extendedAttributesList.join().search("NoInterfaceObject") === -1) {
            /*
			For every exception that is not declared with the [NoInterfaceObject] extended attribute, 
			a corresponding property must exist on the ECMAScript global object. The name of the property 
			is the identifier of the exception, and its value is an object called the exception interface 
			object, which provides access to any constants that have been associated with the exception. 
			The property has the attributes { [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }.
			*/
            var props = {
                value: exceptionInterfaceObject,
                writable: true,
                enumerable: false,
                configurable: true
            };
            Object.defineProperty(window, identifier, props);
        }
        processMembers();
>>>>>>> Fixed a number of bugs, rewrote much of the Exception code

        function processMembers() {
            for (var i = 0; i < exceptionMembers.length; i++) {
                var member = exceptionMembers[i];
                if (member.type === "const") {
                    addConst(exceptionInterfaceObject, member.name, member.value, member.idlType.idlType, member.extAttrs);
                }
            }
        }

        function addConst(obj, name, value, type, extAttrs) {
            /*
				4.9.3. Constants

				For each constant defined on the exception, there must be a corresponding property on the exception interface object, if it exists, if the identifier of the constant is not “prototype”. The property has the following characteristics:

				The name of the property is the identifier of the constant.
				The value of the property is the ECMAScript value that is equivalent to the constant’s IDL value, according to the rules in section 4.2 above.
				The property has attributes { [[Writable]]: false, [[Enumerable]]: true, [[Configurable]]: false }.
				In addition, a property with the same characteristics must exist on the exception interface prototype object.
				*/
            //TODO: convert value
            var prop = {
                value: value,
                writable: false,
                enumerable: true,
                configurable: false
            };
            Object.defineProperty(obj, name, prop);
        }
        //Custom returns hooks based on this object type 
        return {
            exception: {
                identifier: identifier,
                maker: exceptionMaker
            }
        };
    }
    /*
	Figures out the class type of an object, as defined by Web IDL
	*/
    function classType(O) {
        var oType = ECMAScript.Type(O)
        var classType;
        //check platform object
        if (oType === "Function") {
            var name = O.name;
            var nativeString = "function " + name + "() { [native code] }";
            if (O.toString() === nativeString) {
                classType = "platform object";
                return classType;
            }
        }
<<<<<<< HEAD

		 /*
			The exception interface object must also have a property named “prototype” with attributes
			 { [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: false } whose value is an 
			object called the exception interface prototype object. 
			This object also provides access to the constants that are declared on the exception.
		*/
		if (O instanceof Error){
			classType = "Exception";
		}

=======
        /*
		 The exception interface object must also have a property named “prototype” with attributes
		 { [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: false } whose value is an 
		 object called the exception interface prototype object. 
		 This object also provides access to the constants that are declared on the exception.
		*/
        if (O instanceof Error) {
            classType = "Exception";
        }
>>>>>>> Fixed a number of bugs, rewrote much of the Exception code
        if (O.hasOwnProperty("prototype")) {
            /*
			  Interface prototype object
			  The interface object for a non-callback interface 
			  must also have a property named “prototype” with attributes
			  { [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: false } 
			  whose value is an object called the interface prototype object.
			*/
            if (oType === "Object") {
                var protoProps = Object.getOwnPropertyDescriptor(O, "prototype");
                if (protoProps.writable === false && protoProps.enumerable === false && protoProps.configurable === false) {
                    classType = "interface prototype object";
                    return classType;
                }
            }
<<<<<<< HEAD

          
=======
>>>>>>> Fixed a number of bugs, rewrote much of the Exception code
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

    function convertAny(ECMAScriptValue) {}
})();