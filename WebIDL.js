/*
Reference implementation of WebIDL

Code (c) Marcos Caceres, 2011
Distributed under a WTFP License: http://en.wikipedia.org/wiki/WTFPL

This document reproduces parts of the WebIDL specification as comments. The copyright for
that is held by the W3C: http://www.w3.org/Consortium/Legal/2002/copyright-documents-20021231
*/

 (function() {
    //Some aspects of WebIDL can only be implemented when not running in String Mode!
    var WebIDL = Object.create(ECMAScript);
    ECMAScript.DefineOwnProperty(window, "WebIDL", {
        value: WebIDL
    })

    var functions = [ExceptionFactory];
    //Expose functions
    for (var i = 0; i < functions.length; i++) {
        var func = functions[i];
        var props = WebIDL.createDataProperty(func);
        WebIDL.DefineOwnProperty(WebIDL, func.name, props, false);
    }

    //Exceptions container
    //Used to contain exception prototypes
    var exceptionPrototypes = {}


    /*
	As soon as any ECMAScript global environment is created, the following steps must be performed:
	*/
    //Let F be a function object whose behavior when invoked is as follows:
    var F = function() {
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
        if (classType === "platform object" ||
        classType === "interface prototype object" ||
        classType === "exception interface prototype") {
            //then class is O’s class string.
            var prop = ECMAScript.createAccessorProperty(function() {
                return classType
            })
            ECMAScript.DefineOwnProperty(O, "classString", prop);
        }
    }

    function ExceptionFactory(identifier, extendedAttributesList, constants, exceptionFields, parent) {
        /*
		The internal [[Call]] method of an exception interface object must behave as follows, 
		assuming arg0..n−1 is the list of argument values passed to the function, 
		and E is the exception corresponding to the exception interface object:
		*/
        var call = function() {
            //Let O be a new object
            //whose [[Prototype]] internal property is set to
            //the exception interface object
            if (!eInstance) {
                return e;
            }
            var O = Object.create(eInstance.prototype);

            //and whose class string is the identifier of E.
            //If n > 0, then:
            var objInfo = identifier;
            if (arguments[0].length > 0) {
                //Let S be the result of calling ToString(arg0).
                var arg = arguments[0][0].toString();
                var S = ECMAScript.ToString(arg);

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
				
				//Exceptions also have an associated type, also a DOMString, which is exposed 
				//on an exception object in a language binding-specific manner. 
				//The type of an exception is intended to be used to distinguish between the 
				//different kinds of exceptions that can be represented by the given IDL exception.	
				//If a type is not specified, 
				//it is assumed to be the same as the identifier of the exception.
                ECMAScript.DefineOwnProperty(O, "type", {value: identifier});

                objInfo += ": " + S;
            }
            ECMAScript.DefineOwnProperty(O, "toString", {
                value: function() {
                    return objInfo
                }
            });
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
        var e;
        var eInstance = null;
        if (extendedAttributesList.join().search("NoInterfaceObject") === -1) {
            var func = "function " + identifier + "(){ return call(arguments) }";
            var props = "{value: " + func + ", writable: true, enumerable: false, configurable: true }"
            var code = "Object.defineProperty(window, '" + identifier + "', " + props + ")";
            eval(code);
            e = window[identifier];
            eInstance = new e();
        } else {
            var func = "function " + identifier + "(){}";
            var rand = Math.random();
            eval("window[" + rand + "] = " + func);
            e = window[rand];
            delete window[rand];
            eInstance = new e();
        }
		
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
                if (protoProps.writable === false &&
                protoProps.enumerable === false &&
                protoProps.configurable === false) {
                    classType = "interface prototype object";
                    return classType;
                }
            }

            /*
			The exception interface object must also have a property named “prototype” with attributes
			 { [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: false } whose value is an 
			object called the exception interface prototype object. 
			This object also provides access to the constants that are declared on the exception.
			*/
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


    function convertAny(ECMAScriptValue) {


        }



})();