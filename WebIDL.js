/**
 *Reference implementation of WebIDL 
 *This application is (will be!) able to both "implement" and test if an object
 *conforms to its WebIDL definition. 
 *Code (c) Marcos Caceres, 2012 
 *Distributed under a WTFP License: http://en.wikipedia.org/wiki/WTFPL
 *
 *This program reproduces parts of the WebIDL Specification (Candidate Recommendation): 
 *http://dev.w3.org/2006/webapi/WebIDL/
 *Which is copyright © 2012 World Wide Web Consortium, (Massachusetts Institute of Technology, 
 *European Research Consortium for Informatics and Mathematics, Keio University). 
 *All Rights Reserved. http://www.w3.org/Consortium/Legal/2002/copyright-documents-20021231
/**


*Self-calling constructor implements the following interface:

interface WebIDL : ECMAScript {
    static void   test(string WebIDL, object object); 
    static Object implement(string WebIDL); 
};

@param globalScope  Object to which WebIDL will be bound
@param ECMAScript   An implementation of the abstract algorithms of ECMAScript. 
@param WebIDLParser A WebIDL parser
*/
(function (globalScope, ECMAScript, WebIDLParser) {
    "use strict";
    var WebIDLEnv = this;
    //Private variables
    var exceptionPrototypes = {} //Contains exception prototypes
    var interfaceBuilder = new InterfaceBuilder(globalScope) //implements interfaces 
    var exceptionBuilder = new ExceptionBuilder(globalScope) //implements exceptions  
    //toString gets trashed after we initialize, but we sometimes need the native one
    var nativeToString = Object.prototype.toString;
    //Fun starts here :) 
    initialize();
    selfImplement();
    //Implement WebIDL on the global scope
    function selfImplement() {
        //implement thyself. 
        var idl = "interface WebIDL : ECMAScript {" + "   stringifier DOMString wee();" + "   static void   test(string WebIDL, object object);" + "   static object implement(string WebIDL);" + "};"
        var parsedIDL = WebIDLParser.parse(idl);
        var hooks = implement(parsedIDL);
    }
    //Initialize WebIDL as per spec. 
    function initialize() {
        /*
        As soon as any ECMAScript global environment is created, the following steps must be performed:
        Let F be a function object whose behavior when invoked is as follows:
        */
        var F = toString; //defined below, "F" in the spec  
        //Call the [[DefineOwnProperty]] internal method on P with property name “toString”, 
        //descriptor { [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true, [[Value]]: F } 
        //and Boolean flag false.
        var P = Object.prototype;
        var props = {
            writable: true,
            enumerable: false,
            configurable: true,
            value: F
        }
        Object.defineProperty(P, "toString2", props);
        //we keep a way of getting the [[Class]]... it's only gettable through toString
        var props = ECMAScript.createAccessorProperty(getClass)
        Object.defineProperty(P, "__class__", props);
        var props = ECMAScript.createAccessorProperty(getToString)
        Object.defineProperty(P, "__string__", props);

        function toString() {
            //If the this value is undefined, return "[object Undefined]".
            if (this === undefined) {
                return "[object Undefined]";
            }
            //If the this value is null, return "[object Null]"
            if (this === null) {
                return "[object Null]";
            }
            //Let O be the result of calling ToObject passing the this value as the argument.
            var O = ECMAScript.ToObject(this);
            //Let class be a string whose value is determined as follows:
            //If O is a platform object, interface prototype object or 
            //exception interface prototype object,
            if (isExceptionInterfacePrototype(O) || isPlatformObj(O) || interfacePrototypeObject()) {
                //then class is O’s class string.
                var _class = O.__class__;
            } else {
                //Otherwise, class is the value of the [[Class]] internal property of O.
                var _class = nativeToString.call(O);
            }
            //Return the String value that is the result of concatenating the 
            //three Strings "[object ", class, and "]".
            return "[object " + _class + "]";
        }

        function getToString() {
            //we return "Function's toString(), which was not trashed"
            if (this.__class__ === "Function") {
                return this.toString()
            }
            return nativeToString.call(this);
        };

        function getClass() {
            var classString = nativeToString.call(this).match(/^\[object\s\w+\]/);
            var classname = classString[0].match(/\s\w*/)[0].trim();
            return classname;
        };
    }

    function getClassString(obj) {
        return "Wee";
    }
    //Public function tests conformance of some object to a parsed IDL fragment
    function test(obj, parsedIDL) {
        throw TypeError("Not supported yet.");
    }
    //Function implements an IDL fragement
    function implement(parsedIDL) {
        //returns hooks that can be used by other objects
        var impHooks = [];
        if (!parsedIDL || typeof parsedIDL !== "object" || !parsedIDL instanceof Array) {
            throw new TypeError("Expected an array of objects to process");
        }
        //Parsed IDL comes in an array form, as a definition can contain multiple fragments
        for (var i = 0; i < parsedIDL.length; i++) {
            var idlFragment = parsedIDL[i];
            if (!idlFragment.type) {
                console.log("Can't process fragment without type:", idlFragment);
                throw new Error("Can't process fragment without type:" + idlFragment + ". See console.");
            }
            //decompose the parsed fragment
            var identifier = idlFragment.name || idlFragment.identifier;
            var extAttrs = (idlFragment.extAttrs) ? idlFragment.extAttrs : [];
            var members = idlFragment.members;
            var parent = (idlFragment.inheritance) ? idlFragment.inheritance : undefined;
            switch (idlFragment.type) {
            case ("exception"):
                {
                    console.log("Implementing an exception", idlFragment.name, idlFragment);
                    var exception = exceptionBuilder.build(identifier, extAttrs, members, parent);
                    impHooks.push(exception);
                    break;
                }
            case ("interface"):
                {
                    console.log("Implementing an interface", idlFragment.name, idlFragment);
                    interfaceBuilder.build(identifier, members, parent, extAttrs, false)
                    break;
                }
            case ("callbackinterface"):
                {
                    console.log("Implementing an callback", idlFragment.name, idlFragment);
                    interfaceBuilder.build(identifier, members, parent, extAttrs, true)
                    break;
                }
            }
        }
    }

    function InterfaceBuilder(global) {
        //keep a record of things we made
        var interfacesBuilt = [];
        //add public interfaces: 
        var props = ECMAScript.createDataProperty(build);
        Object.defineProperty(this, "build", props);
        //Builds an interface
        function build(identifier, members, parent, extAttrs, isCallback) {
            //TODO: Check if it's a callback with constants
            if (isCallback) {
                var isCBWithConsts = isCBWithConstants(members);
            } else {
                /*
                There must exist an interface prototype object for every 
                non-callback interface defined, regardless of whether the interface 
                was declared with the [NoInterfaceObject] extended attribute.
                The interface prototype object for a particular interface has properties 
                that correspond to the attributes and operations defined on that interface.                 
                */
                var functionBody = "return function " + identifier + "(){/*prototype object*/}"
                var interfacePrototypeObject = new Function(functionBody)();
            }
            var isNoInterface = isNoInterfaceObj(extAttrs);
            //if it's not [NoInterfaceObject] and not a callback with constants 
            if (!isNoInterface && !isCBWithConsts) {
                //if it's not a callback 
                if (!isCallback) {
                    /*
                    a corresponding property must exist on the ECMAScript global object. 
                    The name of the property is the identifier of the interface, 
                    and its value is an object called the interface object.
                    */
                    //the body of the function 
                    var functionBody = "return function " + identifier + "(){  call(extAttrs) }";
                    var interfaceObject = new Function("call", "extAttrs", functionBody)(callOfInterfaceObject, extAttrs);
                    /*
                    Since an interface object for a non-callback interface is a function object, 
                    it will have a “prototype” property with attributes 
                    { [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: false }.
                    */
                    var props = {
                        writable: false,
                        enumerable: false,
                        configurable: false,
                        value: interfacePrototypeObject
                    }
                    Object.defineProperty(interfaceObject, "prototype", props);
                    /*
                    If the [NoInterfaceObject] extended attribute was not specified on the interface, 
                    then the interface prototype object must also have a property named “constructor” 
                    with attributes 
                    { [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true } whose 
                    value is a reference to the interface object for the interface.
                    */
                    var props = {
                        writable: true,
                        enumerable: false,
                        configurable: true,
                        value: interfaceObject
                    }
                    Object.defineProperty(interfacePrototypeObject, "constructor", props)
                    addToGlobal(interfaceObject, extAttrs);
                    //if this has no stringifier, then we add a fake "[native code]"
                    var props = {
                        writable: true,
                        enumerable: false,
                        configurable: true
                    }
                    props.value = function () {
                        return "function " + this.name + "() { [native code] }";
                    };
                    Object.defineProperty(interfaceObject, "toNativeString", props);
                } else {
                    /*The interface object for a callback interface must not be a 
                    function object and must not have a “prototype” property. 
                    The internal [[Prototype]] property of an interface object 
                    for a callback interface must be the Object.prototype object.
                    */
                    var interfacePrototypeObject = {}
                    var interfaceObject = Object.create(interfacePrototypeObject);
                }
            }
            //process any members
            if (members.length > 0) {
                processMembers(members, interfacePrototypeObject, interfaceObject);
            }
        }
        //processes members of an interface... methods and attributes. 
        function processMembers(members, interfacePrototypeObject, interfaceObject) {
            console.log(members, interfacePrototypeObject, interfaceObject);
            //process each member according to its type
            members.forEach(
            function processMemberByType(member) {
              	switch (member.type) {
                case "operation":
                    {
                        addOperation(member, interfacePrototypeObject, interfaceObject);
                    }
                }
            })
        }

        function addOperation(member, interfacePrototypeObject, interfaceObject) {
            //The property has attributes 
            //{ [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true }.
            var prop = {
                writable: true,
                enumerable: true,
                configurable: true,
                value: new Function()
            }
            var id = member.name || member.identifier;
            /*
			For each unique identifier of an operation defined on the interface, 
			there must be a corresponding property on the interface prototype object 
			(if it is a regular operation) or the interface object (if it is a static operation), 
			
			TODO: unless the effective overload set for that identifier and operation 
			and with an argument count of 0 has no entries.
			*/
            if (member[0] !== "static") {
            	console.log("Defining property", id, interfacePrototypeObject)
                //The name of the property is the identifier.
                Object.defineProperty(interfacePrototypeObject, id, prop); 
            } else {
            	console.log("Defining static property", id, interfaceObject)
                Object.defineProperty(interfaceObject, id, prop)
            }
            /*
			In addition, if the interface has a stringifier, then a property must exist on 
			the interface prototype object whose name is “toString”, with attributes
			{ [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true } 
			and whose value is a Function object. 
			*/
            if (member.stringifier) {
                var stringifier = makeStringifier(member).bind(interfacePrototypeObject);
                var stringy = function () {
                        stringifier(member, interfacePrototypeObject);
                    };
                var prop = {
                    writable: true,
                    enumerable: true,
                    configurable: true,
                    value: stringy
                };
                Object.defineProperty(interfacePrototypeObject, "toStringifier", prop);
            }
        }

        function makeStringifier(member) {
            switch (member.type) {
				case "attribute":
					{
						return attributeToString;
					}
				case "operation":
					{
						return operationToString;
					}
				default:
					{
						//If stringifier was specified on an operation with no identifier, 
						//then the behavior of the function is the stringification behavior of the interface, 
						//as described in the prose for the interface.
						return new Function("return 'PROSE BASED STRINGIFIER'");
					}
            }
            /*
			 If stringifier was specified on an attribute A, 
			 then the function, when invoked, must behave as follows:
			*/
            function attributeToString(member, interfacePrototypeObject) {
                //Let O be the result of calling ToObject on the this value.
                var O = ECMAScript.ToObject(this);
                //If O is not an object that implements the interface on which 
                //A was declared, then throw a TypeError.
                if ((O instanceof interfacePrototypeObject) === false) {
                    throw TypeError;
                }
                //Let V be the result of invoking the [[Get]] method of O with P as the argument.
                var V = ECMAScript.Get(O, member.name);
                //Return ToString(V).
                return ECMAScript.ToString(V);
            }
            /*
			If stringifier was specified on an operation with an identifier P, 
			then the function, when invoked, must behave as follows:
			*/
            function operationToString(member, interfacePrototypeObject) {
                //Let O be the result of calling ToObject on the this value.
                var O = ECMAScript.ToObject(this);
                //Let F be the result of invoking the [[Get]] method of object O 
                //with P as the argument.
                var F = ECMAScript.Get(O, member.name);
                //If F is not callable, throw a TypeError.
                if (!ECMAScript.IsCallable(F)) {
                    throw TypeError("Uncallable");
                }
                //Let V be the result of invoking the [[Call]] method of F, 
                //using O as the this value and passing no arguments.
                var V = ECMAScript.Call(F, O);
                //Return ToString(V).
                return ECMAScript.ToString(V);
            }
        }

        function callOfInterfaceObject(extAttrs) {
            //If I was not declared with a [Constructor] extended attribute, then throw a TypeError.
            if (!hasConstructors(extAttrs)) {
               // throw new TypeError('Illegal constructor');
            }
            /*
	        TODO: Initialize S to the effective overload set for constructors with identifier id on interface I and with argument count n.
			Let <constructor, values> be the result of passing S and arg0..n−1 to the overload resolution algorithm.
			Let R be the result of performing the actions listed in the description of constructor with values as the argument values.
			Return the result of converting R to an ECMAScript interface type value I.
	        */
        }

        function hasConstructors(extAttrs) {
            console.warn("hasConstructors not implemented yet, returns false")
            return false
        }
        //Checks if a callback contains any constants
        function isCBWithConstants() {
            console.warn("isCBWithConstants not implemented yet, returns false")
            return false;
        }
        //checks if it's a no interface object
        function isNoInterfaceObj(extAttrs) {
            var found = extAttrs.filter(

            function (element) {
                if (element.name === "NoInterfaceObject") {
                    return element;
                }
            });
            return (found.length > 0);
        }
        /*
        For each attribute defined on the interface, there must exist a corresponding property. 
        @param identifier The name of the property is the identifier of the attribute.
        */
        function addAttributes(object, identifier) {
            /*
			If the attribute was declared with the [Unforgeable] extended attribute, 
			then the property exists on every object that implements the interface. 
			Otherwise, it exists on the interface’s interface prototype object.
			*/
            //The property has attributes 
            //{ [[Get]]: G, [[Set]]: S, [[Enumerable]]: true, [[Configurable]]: configurable }, 
            //where:
            var prop = {
                get: G,
                Set: S,
                enumerable: true,
                configurable: configurable
            }
        }

        function isUnforgable() {
            return false;
        }
        //Adds the interface to global scope    
        function addToGlobal(interfaceObject, extAttrs) {
            /*
            The property has the attributes { [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }. 
            The characteristics of an interface object are described in section 4.4.1 below.
            */
            var prop = {
                writable: true,
                enumerable: false,
                configurable: true,
                value: interfaceObject
            };
            Object.defineProperty(global, interfaceObject.name, prop)
            //add named constructors
            if (hasNamedConstructors()) {
                /*
                TODO: In addition, for every [NamedConstructor] extended attribute on an interface, 
                a corresponding property must exist on the ECMAScript global object. 
                The name of the property is the identifier that occurs directly after the “=”, 
                and its value is an object called a named constructor, 
                which allows construction of objects that implement the interface. 
                The property has the attributes 
                { [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }. 
                The characteristics of a named constructor are described in section 4.4.2 below.
                */
                var prop = {
                    writable: true,
                    enumerable: false,
                    configurable: true
                };
            }
        }

        function hasNamedConstructors(def) {
            //TODO: implement  
            console.log("hasNamedConstructors() not implemented, always returns false")
            return false;
        }
        
        function addConstant(member, interfaceObject, interfaceObjectPrototype){
			/*
			For each constant defined on an interface A, there must be a corresponding property on 
			the interface object, if it exists. The property has the following characteristics:
			*/
			//The name of the property is the identifier of the constant.
			var name = member.name; 
			
			//The value of the property is that which is obtained by converting the constant’s IDL value 
			//to an ECMAScript value.
			
			//The property has attributes { [[Writable]]: false, [[Enumerable]]: true, [[Configurable]]: false }.
			var prop = {writable: false, enumerable: true, configurable: false }; 
			//In addition, a property with the same characteristics must exist on the interface prototype object.
			
        }
        
    }

    function ExceptionBuilder() {
        //keep a record of things we made
        var exceptions = [];
        //add public interfaces: 
        var props = ECMAScript.createDataProperty(build);
        Object.defineProperty(this, "build", props);
        //Builds an interface
        function build(identifier, extendedAttributesList, exceptionMembers, parent) {
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
                exceptionInterfacePrototypeObject = Error;
            }
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
            try {
                Object.defineProperty(exceptionInterfacePrototypeObject, "name", props);
            } catch (e) {}
            /*
        4.9.1. Exception interface object
        */
            var code = "function " + identifier + "(){ throw new TypeError('Illegal constructor')};";
            var exceptionInterfaceObject = Function('return ' + code)();
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
            /*
        4.9.1.1. Exception interface object [[Call]] method
        The internal [[Call]] method of an exception interface object must behave as follows, 
        assuming arg0..n-1 is the list of argument values passed to the function, 
        and E is the exception corresponding to the exception interface object:
        */
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
                    Object.defineProperty(O, "message", prop, true);
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
                var result;
                switch (type) {
                    //primitive types
                case "boolean":
                    {
                        console.warn("not implemented: " + type)
                        break
                    }
                case "float":
                    {
                        console.warn("not implemented: " + type)
                        break
                    }
                case "unresticted float":
                    {
                        console.warn("not implemented: " + type)
                        break
                    }
                case "unrestricted double":
                    {
                        console.warn("not implemented: " + type)
                        break
                    }
                    //integer types 
                case "byte":
                    {
                        console.warn("not implemented: " + type)
                        break
                    }
                case "octet":
                    {
                        console.warn("not implemented: " + type)
                        break
                    }
                case "short":
                    {
                        console.warn("not implemented: " + type)
                        break
                    }
                case "unsigned short":
                    {
                        var result = toUnsignedShort(value, extAttrs)
                        break
                    }
                case "long":
                    {
                        console.warn("not implemented: " + type)
                        break
                    }
                case "unsigned long":
                    {
                        console.warn("not implemented: " + type)
                        break
                    }
                case "long long":
                    {
                        console.warn("not implemented: " + type)
                        break
                    }
                case "unsigned long long":
                    {
                        console.warn("not implemented: " + type)
                        break
                    }
                }
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
    }
    /*
    ***** 4.2. ECMASCRIPT TYPE MAPPING ***********
    This section describes how types in the IDL map to types in ECMAScript.
    */
    /*
    Figures out the class type of an object, as defined by Web IDL
    */
    function toBoolean(V) {
        //Let x be the result of computing ToBoolean(V).
        var x = ECMAScript.ToBoolean(V);
        //Return the IDL boolean value that is the one that represents the same
        //truth value as the ECMAScript Boolean value x.
        return x;
        //The IDL boolean value true is converted to the ECMAScript true value
        //and the IDL boolean value false is converted to the ECMAScript false value.
    }
    /*
    4.2.7. unsigned short
    An ECMAScript value V is converted to an IDL unsigned short value by running the following algorithm:
    */
    function toUnsignedShort(V, extAttrs) {
        //Initialize x to ToNumber(V).
        var x = ECMAScript.ToNumber(V);
        /*
        If the conversion to an IDL value is being performed due to any of the following:
            V is being assigned to an attribute annotated with the [EnforceRange] extended attribute,
            V is being passed as an operation argument annotated with the [EnforceRange] extended attribute, or
            V is being used as the value of dictionary member annotated with the [EnforceRange] extended attribute,
        */
        if (extAttrs.search("EnforceRange") > -1) {
            //If x is NaN, +∞, or -∞, then throw a TypeError.
            if (x === NaN || x === +Infinity || x === -Infinity) {
                throw TypeError();
            }
            //Set x to sign(x) * floor(abs(x)).
            x = ECMAScript.sign(x) * Math.floor(Math.abs(x));
            //If x < 0 or x > 216 - 1, then throw a TypeError.
            if (x < 0 || x > (Math.pow(2, 16) - 1)) {
                throw TypeError();
            }
            //Return the IDL unsigned short value that represents the same numeric value as x.
            return x;
        }
        //Set x to ToUint16(x).
        var x = ECMAScript.ToUint16(x);
        //Return the IDL unsigned short value that represents the same numeric value as x.
        return x;
    }
    /*
    4.2.12. float
    An ECMAScript value V is converted to an IDL float value by running the following algorithm:
    */
    function toFloat(V) {
        //Let x be ToNumber(V).
        var x = ECMAScript.ToNumber(V);
        //If x is NaN, +Infinity or -Infinity, then throw a TypeError.
        if (x === NaN || x === +Infinity || x === -Infinity) {
            throw TypeError();
        }
        //Let S be the set of finite IEEE 754 single-precision floating point values except -0, 
        //but with two special values added: 2128 and -2128.
        //var S = 
        //Let y be the number in S that is closest to x, selecting the number with an even significand if there are two equally close values ([ECMA-262], section 8.5). (The two special values 2128 and -2128 are considered to have even significands for this purpose.)
        //If y is 2128 or -2128, then throw a TypeError.
        //If y is +0 and x is negative, return -0.
        //Return y.
        //The result of converting an IDL float value to an ECMAScript value is the Number value that represents the same numeric value as the IDL float value.
    }
    /*
    4.2.17. object
    IDL object values are represented by ECMAScript Object values.
    An ECMAScript value V is converted to an IDL object value by running the following algorithm:
    */
    function toObject(V) {
        //If Type(V) is not Object, then throw a TypeError.
        if (ECMAScript.Type(v) !== "Object") {
            throw TypeError();
        }
        //Return the IDL object value that is a reference to the same object as V.
        return V;
        //The result of converting an IDL object value to an ECMAScript value is the Object value that represents a reference to the same object that the IDL object represents.
    }
    /*
    4.2.18. Interface types
    IDL interface type values are represented by ECMAScript Object or Function values.
    An ECMAScript value V is converted to an IDL interface type value by running the following algorithm (where I is the interface):
    */
    function toInterface(V, I) {
        //If Type(V) is not Object, then throw a TypeError.
        if (ECMAScript.Type(V !== "Object")) {
            throw TypeError();
        }
        //If V is a platform object that implements I, then return the IDL interface type value that represents a reference to that platform object.
        if (classType(V) === "platform object") {}
        //If V is a user object that is considered to implement I according to the rules in section 4.7, then return the IDL interface type value that represents a reference to that user object.
        //Throw a TypeError.
        //The result of converting an IDL interface type value to an ECMAScript value is the Object value that represents a reference to the same object that the IDL interface type value represents.
    }
    /*
    4.2.26. Date
    IDL Date values are represented by ECMAScript Date objects.
    An ECMAScript value V is converted to an IDL Date value by running the following algorithm:
    */
    function toDate(V) {
        //If V is not an ECMAScript Date object, then throw a TypeError.
        if (V instanceof Date === false) {}
        //If the time value of V is NaN, then return the undefined IDL Date value.
        if (isNaN(V.valueOf())) {}
        //Return the IDL Date value that represents the same time value as V.
        //An IDL Date value V is converted to an ECMAScript value by running the following the algorithm:
        //If V is the undefined Date value, then return a newly constructed ECMAScript Date object whose time value is NaN.
        //Otherwise, return a newly constructed ECMAScript Date object that represents the same millisecond as V.
        //Platform objects returning an ECMAScript Date object from attributes, operations or exception field do not hold on to a reference to the Date object. A script that modifies a Date object so retrieved cannot affect the platform object it was retrieved from.S
    }

    function classType(O) {
        var oType = ECMAScript.Type(O)
        if (oType === "Object") {
            if (isExceptionInterfacePrototype(O)) {
                return "exception interface prototype";
            }
            if (isInterfacePrototypeObject(O)) {
                return "interface prototype object";
            }
            if (isPlatformObj(O)) {
                return "platform object";
            }
            return "user object";
        }
        //it's not an object, so just return the type
        return oType;
    }

    function isInterfacePrototypeObject(O) {
        var oType = ECMAScript.Type(O);
        if (oType !== "Object") {
            return false;
        }
        if (isExceptionInterfacePrototype(O)) {
            return false;
        }
        if (O.hasOwnProperty && O.hasOwnProperty("prototype")) {
            var protoProps = Object.getOwnPropertyDescriptor(O, "prototype");
            /*
            If the [NoInterfaceObject] extended attribute was not specified on the interface, 
            then the interface prototype object must also have a property named “constructor” 
            with attributes { [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true } 
            whose value is a reference to the interface object for the interface.
            */
            if (O.hasOwnProperty("constructor")) {
                var prop = Object.getOwnPropertyDescriptor(Image.prototype, "constructor");
                var write = prop.writable === true;
                var enum_ = prop.enumerable === false;
                var config = prop.configurable === true;
                if (!write || !enum_ || !config) {
                    return false;
                }
            }
            /*
            The interface prototype object for a given interface A 
            must have an internal [[Prototype]] property whose value is as follows:
            */
            var proto = Object.getPrototypeOf(O);
            /*
            TODO: If A is declared with the [NamedPropertiesObject] extended attribute, 
            then the value of the internal [[Prototype]] property of A is the named properties 
            object for A, as defined in section 4.4.4 below.
            */
            /*
            Otherwise, if A is not declared to inherit from another interface, then the value of 
            the internal [[Prototype]] property of A is the Array prototype object ([ECMA-262],
            section 15.4.4) if the interface was declared with [ArrayClass], or the Object prototype
            object otherwise ([ECMA-262], section 15.2.4).
            */
            if ((proto instanceof Array) === false || (proto instanceof Object) === false) {
                return false;
            }
            /*
            Otherwise, the value of the internal [[Prototype]] property of A is the interface 
            prototype object for the inherited interface.
            */
            return true;
        }
        return false;
    }

    function isException(O) {
        var oType = ECMAScript.Type(O);
        if (oType !== "Object") {
            return false;
        }
        //All true exceptions have object in their inheritance chain  
        if (O instanceof Error) {
            return true;
        }
        return false;
    }

    function isExceptionInterfacePrototype(O) {
        var oType = ECMAScript.Type(O);
        if (oType !== "Object") {
            return false;
        }
        if (O.hasOwnProperty && O.hasOwnProperty("prototype")) {
            var protoProps = Object.getOwnPropertyDescriptor(O, "prototype");
            if (protoProps.writable === false && protoProps.enumerable === false && protoProps.configurable === false) {
                //Note: Some implementations, like Chrome, have a custom ErrorPrototype object
                //whose function name is "Error" 
                if (O.prototype instanceof Error || (O.prototype === Error.prototype)) {
                    return true;
                }
            }
        }
        return false;
    }

    function isPlatformObj(O) {
        var oType = ECMAScript.Type(O);
        if (oType !== "Object") {
            return false;
        }
        var oClass = O.__class__;
        var nativeTypeNames = "String,Number,Array".split(",");
        if (nativeTypeNames.indexOf(oClass) > -1) {
            return false;
        }
        //get all the platform objects bound to the window object
        var testName = "function " + oClass + "() { [native code] }";
        var globalInstance = globalScope[oClass];
        if (typeof globalInstance === "function") {
            if (testName === globalInstance.toString()) {
                return true;
            }
        }
        return false
    }
    /*
        3.10. Types
        http://dev.w3.org/2006/webapi/WebIDL/#idl-types
        */
    /*
        Helper base class 
        */
    function WebIDLBase(typeName) {
        var props = {
            get: function () {
                return typeName
            }
        }
        Object.defineProperty(this, "typeName", props);
    }
    //The following types are known as integer types: byte, octet, short, unsigned short, long, unsigned long, long long and unsigned long long.
    var integerTypes = [];
    //primitive types: boolean, the integer types, float, unresticted float, double and unrestricted double.
    var primitiveTypes = [];
    /*
        3.10.1. any
        The any type is the union of all other possible non-union types. Its type name is “Any”.

        The any type is like a discriminated union type, in that each of its values has a specific non-any type associated with it. For example, one value of the any type is the unsigned long 150, while another is the long 150. These are distinct values.

        The particular type of an any value is known as its specific type. (Values of union types also have specific types.)
        */
    function WebIDLAny(value) {
        this.prototype.constructor.call(this, "Any")
    }
    WebIDLAny.prototype = WebIDLBase;
    /*
        3.10.2. boolean
        The boolean type has two values: true and false.
        boolean constant values in IDL are represented with the true and false tokens.
        The type name of the boolean type is “Boolean”.
        */
    function WebIDLBoolean(value) {
        if (value !== true || value !== false) {
            throw TypeError("The boolean type has two values: true and false.");
        }
        this.prototype.constructor.call(this, "Boolean")
    }
    WebIDLBoolean.prototype = WebIDLBase;
    /*
        The byte type is a signed integer type that has values in the range [-128, 127].
        byte constant values in IDL are represented with integer tokens.
        The type name of the byte type is “Byte”.
        */
    function WebIDLByte() {
        var valueRestriction = [-128, 127];
        this.prototype.constructor.call(this, "Byte");
    }
    WebIDLByte.prototype = WebIDLBase;
    /*
        3.10.4. octet
        The octet type is an unsigned integer type that has values in the range [0, 255].
        octet constant values in IDL are represented with integer tokens.
        The type name of the octet type is “Octet”.
        */
    function WebIDLByte() {
        var valueRestriction = [0, 255];
        this.prototype.constructor.call(this, "Octet");
    }
    WebIDLByte.prototype = WebIDLBase;
    /*
        3.10.5. short
        The short type is a signed integer type that has values in the range [-32768, 32767].
        short constant values in IDL are represented with integer tokens.
        The type name of the short type is “Short”.
        */
    function WebIDLShort() {
        var valueRestriction = [-32768, 32767];
        this.prototype.constructor.call(this, "Short");
    }
    WebIDLShort.prototype = WebIDLBase;
    /*
        3.10.6. unsigned short
        The unsigned short type is an unsigned integer type that has values in the range [0, 65535].
        unsigned short constant values in IDL are represented with integer tokens.
        The type name of the unsigned short type is “UnsignedShort”.
        */
    function WebIDLUnsignedShort() {
        var valueRestriction = [0, 65535];
        this.prototype.constructor.call(this, "UnsignedShort");
    }
    WebIDLUnsignedShort.prototype = WebIDLBase;
    /*st
        3.10.7. long
        The long type is a signed integer type that has values in the range [-2147483648, 2147483647].
        long constant values in IDL are represented with integer tokens.
        The type name of the long type is “Long”.
        */
    function WebIDLLong() {
        var valueRestriction = [-2147483648, 2147483647];
        this.prototype.constructor.call(this, "Long");
    }
    WebIDLUnsignedShort.prototype = WebIDLBase;
    /*
        3.10.8. unsigned long
        The unsigned long type is an unsigned integer type that has values in the range [0, 4294967295].
        unsigned long constant values in IDL are represented with integer tokens.
        The type name of the unsigned long type is “UnsignedLong”.
        */
    function WebIDLUnsignedLong() {
        var valueRestriction = [0, 4294967295];
        this.prototype.constructor.call(this, "UnsignedLong");
    }
    WebIDLUnsignedLong.prototype = WebIDLBase;
    /*
        3.10.9. long long
        The long long type is a signed integer type that has values in the range [-9223372036854775808, 9223372036854775807].
        long long constant values in IDL are represented with integer tokens.
        The type name of the long long type is “LongLong”.
        */
    function WebIDLLongLong() {
        var valueRestriction = [-9223372036854775808, 9223372036854775807];
        this.prototype.constructor.call(this, "LongLong");
    }
    WebIDLLongLong.prototype = WebIDLBase;
    /*
        3.10.10. unsigned long long
        The unsigned long long type is an unsigned integer type that has values in the range [0, 18446744073709551615].
        unsigned long long constant values in IDL are represented with integer tokens.
        The type name of the unsigned long long type is “UnsignedLongLong”.
        */
    function WebIDLUnsignedLongLong() {
        var valueRestriction = [0, 18446744073709551615];
        this.prototype.constructor.call(this, "UnsignedLongLong");
    }
    WebIDLUnsignedLongLong.prototype = WebIDLBase;
    /*
        3.10.11. float
        The float type is a floating point numeric type that corresponds to the set of 
        finite single-precision 32 bit IEEE 754 floating point numbers. [IEEE-754]
        float constant values in IDL are represented with float tokens.
        The type name of the float type is “Float”.
        */
    function WebIDLFloat() {
        //TODO: http://en.wikipedia.org/wiki/Single_precision_floating-point_format
        this.prototype.constructor.call(this, "Float");
    }
    WebIDLFloat.prototype = WebIDLBase;
    /*
        3.10.13. double §
        The double type is a floating point numeric type that corresponds to the set of finite 
        double-precision 64 bit IEEE 754 floating point numbers. [IEEE-754]
        double constant values in IDL are represented with float tokens.
        The type name of the double type is “Double”.
        */
    function WebIDLDouble() {
        throw "Not Supported";
        //TODO: http://en.wikipedia.org/wiki/Single_precision_floating-point_format
        this.prototype.constructor.call(this, "Double");
    }
    WebIDLDouble.prototype = WebIDLBase;
    /*
        3.10.14. unrestricted double
        The unrestricted double type is a floating point numeric type that corresponds to the set of all 
        possible double-precision 32 bit IEEE 754 floating point numbers, finite and non-finite. [IEEE-754]
        unrestricted double constant values in IDL are represented with float tokens.
        The type name of the unrestricted double type is “UnrestrictedDouble”.
        */
    function WebIDLUnrestrictedDouble() {
        throw "Not Supported";
        //TODO: http://en.wikipedia.org/wiki/Single_precision_floating-point_format
        this.prototype.constructor.call(this, "UnrestrictedDouble");
    }
    WebIDLUnrestrictedDouble.prototype = WebIDLBase;
    /*
    3.10.15. DOMString
    The DOMString type corresponds to the set of all possible sequences of code units. Such sequences are commonly interpreted as UTF-16 encoded strings
    [RFC2781] although this is not required. While DOMString is defined to be an OMG IDL boxed sequence<unsigned short> valuetype in DOM Level 3 Core
    ([DOM3CORE], section 1.2.1), this document defines DOMString to be an intrinsic type so as to avoid special casing that sequence type in various
    situations where a string is required. 
    
    The type name of the DOMString type is “String”.

    Note
    Note also that null is not a value of type DOMString. To allow null, a nullable DOMString, written as DOMString? in IDL, needs to be used.
    */
    function WebIDLDOMString(value) {
        /*
        Nothing in this specification requires a DOMString value to be a valid UTF-16 string. 
        For example, a DOMString value might include unmatched surrogate
        pair characters. However, authors of specifications using Web IDL might want to obtain a 
        sequence of Unicode characters given a particular sequence of
        code units. 

        The following algorithm defines a way to convert a DOMString to a sequence of Unicode characters:
        Let S be the DOMString value.
        */
        var value = convertToUnicode(value);
        this.prototype.constructor.call(this, "String");

        function convertToUnicode(S) {
            //Let n be the length of S.
            var n = S.length;
            //Initialize i to 0.
            var i = 0;
            //Initialize U to be an empty sequence of Unicode characters.
            var U = [];
            //While i < n:
            while (i < n) {
                //Let c be the code unit in S at index i.
                var c = Number("0x" + S[i].charCodeAt().toString(16));
                //Depending on the value of c:
                //c < 0xD800 or c > 0xDFFF
                if (c < 0xD800 || c > 0xDFFF) {
                    //Append to U the Unicode character with code point c.
                    U.push(String.fromCharCode(c));
                } else if (0xDC00 <= c <= 0xDFFF) {
                    //Append to U a U+FFFD REPLACEMENT CHARACTER.
                    U.push("\uFFFD");
                } else if (0xD800 <= c <= 0xDBFF) {
                    //If i = n-1, then append to U a U+FFFD REPLACEMENT CHARACTER.
                    if (i = n - 1) {
                        U.push("\uFFFD");
                        //Otherwise, i < n-1:    
                    } else if (i < n - 1) {
                        //Let d be the code unit in S at index i+1.
                        var d = Number("0x" + S[i + 1].charCodeAt().toString(16));
                        //If 0xDC00 ≤ d ≤ 0xDFFF, then:
                        if (0xDC00 <= d <= 0xDFFF) {
                            //Let a be c & 0x3FF.
                            var a = c & 0x3FF;
                            //Let b be d & 0x3FF.
                            var b = d & 0x3FF;
                            //Append to U the Unicode character with code point 216+210a+b.
                            newc = "\u" + (Math.pow(2, 16) + Math.pow(2, 10) + a + b);
                            U.push(newc);
                            //Set i to i+1.
                            i = i + 1;
                            //Otherwise, d < 0xDC00 or d > 0xDFFF.
                        } else if (d < 0xDC00 || d > 0xDFFF) {
                            //Append to U a U+FFFD REPLACEMENT CHARACTER.
                            U.push("\uFFFD");
                        }
                    }
                }
                i = i + 1;
            }
            //Return U.
            return U.join("");
        }
        this.prototype.constructor.call(this, "String");
        /*
        There is no way to represent a constant DOMString value in IDL, although DOMString dictionary member and operation optional argument default 
        values an be specified using a string literal.
        */
    }
    WebIDLDOMString.prototype = WebIDLBase;
    /*
    3.10.16. object
    The object type corresponds to the set of all possible non-null object references.
    There is no way to represent a constant object value in IDL.
    To denote a type that includes all possible object references plus the null value, use the nullable type object?.
    The type name of the object type is “Object”.
    */
    function WebIDLObject() {
        this.prototype.constructor.call(this, "Object");
    }
    WebIDLObject.prototype = WebIDLBase;
    /*
     3.10.25. Date
     The Date type is a type that represents an instant in time with millisecond accuracy. 
     The instants in time that this type can represent are the same that can be represented with 
     ECMAScript Date objects ([ECMA-262], section 15.9.1.1) – namely, every millisecond in the 
     200,000,000 days centered around midnight of 1 January, 1970 UTC, except for any millisecond 
     that is part of an inserted leap second, because they cannot be represented by this type.

     An additional value that this type can represent is one that indicates an indeterminate 
     or undefined time, which we write as undefined.

     There is no way to represent a constant Date value in IDL.

     The type name of the Date type is “Date”.
    */
    function WebIDLDate() {
        this.prototype.constructor.call(this, "Date");
    }
    WebIDLDate.prototype = WebIDLBase;
    /*
    4. ECMAScript binding
    http://dev.w3.org/2006/webapi/WebIDL/#ecmascript-binding
    */
    function convertAny(ECMAScriptValue) {}
})(window, ECMAScript, window.WebIDLParser);
/*tests (function () {
    var predefined_exceptions = [Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError]
    for (var i = 0; i < predefined_exceptions.length; i++) {
        var e = predefined_exceptions[i];
        console.log(WebIDL.classType(e) === "exception interface prototype")
    }
    for (i in window) {
        console.log(i + " is a: " + WebIDL.classType(window[i]))
    }
})();
*/