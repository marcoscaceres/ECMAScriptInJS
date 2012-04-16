(function () {
    "use strict";
    var ECMAScript = Object.create({});
    var functions = [Get,ToPrimitive, ToBoolean, ToNumber, ToInteger, ToInt32, ToUint32, IsDataDescriptor, IsAccessorDescriptor, ToUint16, ToString, ToObject, CheckObjectCoercible, IsCallable, SameValue, Type, DefineOwnProperty, createDataProperty, createAccessorProperty, Call];
    //Expose functions 
    for (var i = 0; i < functions.length; i++) {
        var func = functions[i];
        var props = createDataProperty(func);
        DefineOwnProperty(ECMAScript, func.name, props, false);
    }
    var props = createDataProperty(ECMAScript);
    DefineOwnProperty(window, "ECMAScript", props, false);
    //Custom helper function, checks for primitive types
    function isPrimitiveValue(x) {
        //member of one of the types Undefined, Null, Boolean, Number, or String as defined in Clause 8.
        if (Type(x) !== "Object") {
            return true;
        }
        return false;
    }

    function createAccessorProperty(getter, setter, enumerable, configurable) {
        var prop = {};
        /*
		[[Get]] Object or Undefined
		If the value is an Object it must be a function Object. 
		The function’s [[Call]] internal method (8.6.2) is called with an empty arguments list to 
		return the property value each time a get access of the property is performed.
		Default value: undefined 
		*/
        if (getter === undefined || IsCallable(getter)) {
            prop["get"] = getter;
        } else {
            throw TypeError("Getter must be a function: " + getter);
        }
        /*
		[[Set]] Object or Undefined
		If the value is an Object it must be a function Object. The function’s [[Call]] internal 
		method (8.6.2) is called with an arguments list containing the assigned value as its sole 
		argument each time a set access of the property is performed. 
		The effect of a property's [[Set]] internal method may, but is not required to, 
		have an effect on the value returned by subsequent calls to the property's [[Get]] internal 
		method.
		Default value: undefined 
		*/
        if (setter === undefined || IsCallable(setter)) {
            prop["set"] = setter;
        } else {
            throw TypeError("Setter must be a function: " + setter);
        }
        /*
		[[Enumerable]] Boolean
		If true, the property is to be enumerated by a for-in enumeration (see 12.6.4). Otherwise, 
		the property is said to be non-enumerable.
		Default value: false
		*/
        prop.enumerable = ToBoolean(enumerable);
        /*
		[[Configurable]] Boolean
		If false, attempts to delete the property, change the property to be a data property, 
		or change its attributes will fail.
		*/
        prop.configurable = ToBoolean(configurable);
        return prop;
    }

    function createDataProperty(value, writable, enumerable, configurable) {
        var prop = {};
        //[[Value]]
        //Type: Any ECMAScript language type
        //The value retrieved by reading the property.
        //default: undefined
        prop.value = value;
        //[[Writable]]
        //Type: Boolean
        //If false, attempts by ECMAScript code to change the property’s [[Value]] attribute using
        //[[Put]] will not succeed.
        //Default: false
        prop.writable = ToBoolean(writable);
        //[[Enumerable]]
        //Type: Boolean
        //If true, the property will be enumerated by a for-in enumeration (see 12.6.4).
        //Otherwise, the property is said to be non-enumerable.
        //Default: false
        prop.enumerable = ToBoolean(enumerable);
        //[[Configurable]]
        //Type: Boolean
        //If false, attempts to delete the property, change the property to be an accessor property,
        //or change its attributes (other than [[Value]]) will fail.
        //Default: false
        prop.configurable = ToBoolean(configurable);
        return prop;
    }

    function IsAccessorDescriptor(Desc) {
        /*
		8.10.1 IsAccessorDescriptor ( Desc ) # Ⓣ 
		When the abstract operation IsAccessorDescriptor is called with property descriptor Desc, 
		the following steps are taken:
		*/
        //If Desc is undefined, then return false.
        if (Desc === undefined) {
            return false;
        }
        //If both Desc.[[Get]] and Desc.[[Set]] are absent, then return false.
        var hasGet = Desc.hasOwnProperty("get");
        var hasSet = Desc.hasOwnProperty("set");
        if (!hasGet && !hasSet) {
            return false;
        }
        //Return true.
        return true;
    }

    function IsDataDescriptor(Desc) {
        /*8.10.2 IsDataDescriptor ( Desc ) # Ⓣ 
		When the abstract operation IsDataDescriptor is called with property descriptor Desc, 
		the following steps are taken:
		*/
        //If Desc is undefined, then return false.
        if (Desc === undefined) {
            return false;
        }
        //If both Desc.[[Value]] and Desc.[[Writable]] are absent,
        var hasValue = Desc.hasOwnProperty("value");
        var hasWritable = Desc.hasOwnProperty("writable");
        if (!hasValue && !hasWritable) {
            // then return false.
            return false
        }
        //Return true.
        return true;
    }

    function IsGenericDescriptor(Desc) {
        /*
		8.10.3 IsGenericDescriptor ( Desc ) # Ⓣ 
		When the abstract operation IsGenericDescriptor is called with property descriptor Desc, the following steps are taken:
		*/
        //If Desc is undefined, then return false.
        if (Desc === undefined) {
            return false;
        }
        //If IsAccessorDescriptor(Desc) and IsDataDescriptor(Desc) are both false, then return true.
        var isAccessor = IsAccessorDescriptor(Desc);
        var isDataDesc = IsDataDescriptor(Desc);
        if (!isAccessor && !isDataDesc) {
            return true;
        }
        //Return false.
        return false;
    }

    function FromPropertyDescriptor(Desc) {
        /*
		8.10.4 FromPropertyDescriptor ( Desc ) # Ⓣ 
		When the abstract operation FromPropertyDescriptor is called with property descriptor Desc, 
		the following steps are taken:
		The following algorithm assumes that Desc is a fully populated Property Descriptor,
		such as that returned from [[GetOwnProperty]] (see 8.12.1).
		*/
        //If Desc is undefined, then return undefined.
        if (Desc === undefined) {
            return false;
        }
        //Let obj be the result of creating a new object as if by the expression new Object()
        //where Object is the standard built-in constructor with that name.
        var obj = new Object();
        //If IsDataDescriptor(Desc) is true, then
        if (IsDataDescriptor(Desc) === true) {
            //Call the [[DefineOwnProperty]] internal method of obj with arguments "value", Property Descriptor {[[Value]]: Desc.[[Value]], [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true}, and false.
            //Call the [[DefineOwnProperty]] internal method of obj with arguments "writable", Property Descriptor {[[Value]]: Desc.[[Writable]], [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true}, and false.
        }
        //Else, IsAccessorDescriptor(Desc) must be true, so
        //Call the [[DefineOwnProperty]] internal method of obj with arguments "get", Property Descriptor {[[Value]]: Desc.[[Get]], [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true}, and false.
        //Call the [[DefineOwnProperty]] internal method of obj with arguments "set", Property Descriptor {[[Value]]: Desc.[[Set]], [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true}, and false.
        //Call the [[DefineOwnProperty]] internal method of obj with arguments "enumerable", Property Descriptor {[[Value]]: Desc.[[Enumerable]], [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true}, and false.
        //Call the [[DefineOwnProperty]] internal method of obj with arguments "configurable", Property Descriptor {[[Value]]: Desc.[[Configurable]], [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true}, and false.
        //Return obj.
    }
    /*
	8.12 Algorithms for Object Internal Methods # Ⓣ Ⓓ
	In the following algorithm descriptions, assume O is a native ECMAScript object, P is a String, 
	Desc is a Property Description record, and Throw is a Boolean flag.
	*/
    function GetOwnProperty(O, P) {
        /*8.12.1 [[GetOwnProperty]] (P) #
		When the [[GetOwnProperty]] internal method of O is called with property name P, 
		the following steps are taken:
		*/
        //If O doesn’t have an own property with name P, return undefined.
        if (!O.hasOwnProperty(P)) {
            return undefined;
        }
        //Let D be a newly created Property Descriptor with no fields.
        var D = Object.create({});
        //Let X be O’s own property named P.
        var X = Object.getOwnPropertyDescriptor(O, P)
        //If X is a data property, then
        //(A data property descriptor is one that includes any fields named either [[Value]]
        //or [[Writable]].)
        if (X.hasOwnProperty("value") || X.hasOwnProperty("writable")) {
            //Set D.[[Value]] to the value of X’s [[Value]] attribute.
            D.value = X.value;
            //Set D.[[Writable]] to the value of X’s [[Writable]] attribute
            D.writable = X.writable;
            //Else X is an accessor property, so	
        } else {
            //Set D.[[Get]] to the value of X’s [[Get]] attribute.
            D.get = X.get;
            //Set D.[[Set]] to the value of X’s [[Set]] attribute.
            D.set = X.set;
        }
        //Set D.[[Enumerable]] to the value of X’s [[Enumerable]] attribute.
        D.enumerable = X.enumerable;
        //Set D.[[Configurable]] to the value of X’s [[Configurable]] attribute.
        D.configurable = X.configurable;
        //Return D.
        return D;
    }

    function GetProperty(O, P) {
        //8.12.2 [[GetProperty]] (P) # Ⓣ
        //When the [[GetProperty]] internal method of O is called with property name P,
        //the following steps are taken:	
        //Let prop be the result of calling the [[GetOwnProperty]] internal method of O with
        //property name P.
        var prop = GetOwnProperty(O, P);
        //If prop is not undefined, return prop.
        if (prop !== undefined) {
            return prop;
        }
        //Let proto be the value of the [[Prototype]] internal property of O.
        var proto = Object.getPrototypeOf(O); 
        //If proto is null, return undefined.
        if (proto === null) {
            return undefined;
        }
        //Return the result of calling the [[GetProperty]] internal method of proto with argument P.
        return GetProperty(proto, P);
    }

    function Get(O, P) {
        //8.12.3 [[Get]] (P) # Ⓣ
        //When the [[Get]] internal method of O is called with property name P,
        //the following steps are taken:
        //Let desc be the result of calling the [[GetProperty]] internal method of O with property name P.
        var desc = GetProperty(O, P);
        //If desc is undefined, return undefined.
        if (desc === undefined) {
            return undefined;
        }
        //If IsDataDescriptor(desc) is true,
        var isDataDesc = IsDataDescriptor(desc);
        if (isDataDesc === true) {
            // return desc.[[Value]].
            return desc.value
        }
        //Otherwise, IsAccessorDescriptor(desc) must be true so, let getter be desc.[[Get]].
        var getter = desc.get;
        //If getter is undefined, return undefined.
        if (getter === undefined) {
            return undefined;
        }
        //Return the result calling the [[Call]] internal method of getter providing O as
        //the this value and providing no arguments.
        return Call(getter, O);
    }

    function CanPut(O, P) {
        /*
		8.12.4 [[CanPut]] (P) # Ⓣ 
		When the [[CanPut]] internal method of O is called with property name P, the following steps are taken:
		*/
        //Let desc be the result of calling the [[GetOwnProperty]] internal method of O with argument P.
        var desc = GetOwnProperty(O, P);
        //If desc is not undefined, then
        if (desc !== undefined) {
            //If IsAccessorDescriptor(desc) is true, then
            if (IsAccessorDescriptor(desc) === true) {
                //If desc.[[Set]] is undefined,
                if (desc.set === undefined) {
                    // then return false.
                    return false;
                }
                //Else return true.
                return true;
            }
            //Else, desc must be a DataDescriptor so return the value of desc.[[Writable]].
            return desc.writable;
        }
        //Let proto be the [[Prototype]] internal property of O.
        var proto = O.prototype;
        //If proto is null,
        if (proto === null) {
            //then return the value of the [[Extensible]] internal property of O.
            return Object.isExtensible(O);
        }
        //Let inherited be the result of calling the [[GetProperty]] internal method of proto with
        //property name P.
        var inherited = GetProperty(proto, P);
        //If inherited is undefined,
        if (inherited === undefined) {
            //return the value of the [[Extensible]] internal property of O.
            return Object.isExtensible(O);
        }
        //If IsAccessorDescriptor(inherited) is true, then
        if (IsAccessorDescriptor(inherited) === true) {
            //If inherited.[[Set]] is undefined,
            if (inherited["set"] === undefined) {
                //then return false.
                return false;
            }
            //Else return true.
            return true;
        }
        //Else, inherited must be a DataDescriptor
        //If the [[Extensible]] internal property of O is false, return false.
        if (!Object.isExtensible(O)) {
            return false;
        }
        //Else return the value of inherited.[[Writable]].
        return inherited.writable;
        //Host objects may define additional constraints upon [[Put]] operations. If possible, host objects should not allow [[Put]] operations in situations where this definition of [[CanPut]] returns false.
    }
    /*8.12.8 [[DefaultValue]] (hint)*/
    function DefaultValue(O, hint) {
        switch (hint) {
            /*
			When the [[DefaultValue]] internal method of O is called with hint String, 
			the following steps are taken:
			*/
        case "String":
            {
                //Let toString be the result of calling the [[Get]] internal method of object O with
                //argument "toString".
                var toString = Get(O, "toString");
                //If IsCallable(toString) is true then,
                if (IsCallable(toString) === true) {
                    //Let str be the result of calling the [[Call]] internal method of toString,
                    //with O as the this value and an empty argument list.
                    var str = Call(toString, O);
                    //If str is a primitive value, return str.
                    if (isPrimitiveValue(str)) {
                        return str;
                    }
                }
                //Let valueOf be the result of calling the [[Get]] internal method of object O
                //with argument "valueOf".	
                var valueOf = Get(O, "valueOf");
                //If IsCallable(valueOf) is true then,
                if (IsCallable(valueOf) === true) {
                    //Let val be the result of calling the [[Call]] internal method of valueOf,
                    //with O as the this value and an empty argument list.
                    var val = Call(valueOf, O);
                    //If val is a primitive value, return val.
                    if (isPrimitiveValue(val) === true) {
                        return val;
                    }
                }
                //Throw a TypeError exception.
                throw new TypeError();
                break;
            }
            //case "String"
        case "Number":
            {
                /*
				When the [[DefaultValue]] internal method of O is called with hint Number, 
				the following steps are taken:
				*/
                //Let valueOf be the result of calling the [[Get]] internal method of object
                //O with argument "valueOf".
                var valueOf = Get(O, "valueOf");
                //If IsCallable(valueOf) is true then,
                if (IsCallable(valueOf) === true) {
                    //Let val be the result of calling the [[Call]] internal method of valueOf,
                    //with O as the this value and an empty argument list.
                    var val = Call(valueOf, O);
                    //If val is a primitive value, return val.
                    if (isPrimitiveValue(val) === true) {
                        return val;
                    }
                }
                //Let toString be the result of calling the [[Get]] internal method of object O with
                //argument "toString".
                var toString = Get(O, "toString");
                //If IsCallable(toString) is true then,
                if (IsCallable(toString) === true) {
                    //Let str be the result of calling the [[Call]] internal method of toString,
                    //with O as the this value and an empty argument list.
                    var str = Call(toString, O);
                    //If str is a primitive value, return str.
                    if (isPrimitiveValue(str)) {
                        return str;
                    }
                }
                //Throw a TypeError exception.
                throw new TypeError();
            }
            //case Number
        default:
            {
                //When the [[DefaultValue]] internal method of O is called with no hint,
                //then it behaves as if the hint were Number, unless O is a Date object (see 15.9.6),
                //in which case it behaves as if the hint were String.
                if (O instanceof Date) {
                    return DefaultValue(O, "String");
                }
                DefaultValue(O, "Number");
            }
        }
        //switch
        //The above specification of [[DefaultValue]] for native objects can return only primitive
        //values. If a host object implements its own [[DefaultValue]] internal method, it must ensure that its [[DefaultValue]] internal method can return only primitive values.
    }

    function DefineOwnProperty(O, P, Desc, Throw) {
        /*
		8.12.9 [[DefineOwnProperty]] (P, Desc, Throw) # Ⓣ 
		In the following algorithm, the term “Reject” means “If Throw is true, 
		then throw a TypeError exception, otherwise return false”. 
		*/
        function Reject(bool) {
            if (bool === true) {
                throw TypeError;
            }
            return false
        }
        /*
		The algorithm contains steps that test various fields of the Property Descriptor Desc 
		for specific values. The fields that are tested in this manner need not actually exist in 
		Desc. If a field is absent then its value is considered to be false.
		
		When the [[DefineOwnProperty]] internal method of O is called with property name P, 
		property descriptor Desc, and Boolean flag Throw, the following steps are taken:
		*/
        //Let current be the result of calling the [[GetOwnProperty]] internal method of O with
        //property name P.
        var current = GetOwnProperty(O, P);
        //Let extensible be the value of the [[Extensible]] internal property of O.
        var extensible = Object.isExtensible(O);
        //If current is undefined and extensible is false, then Reject.
        if (current === undefined && extensible === false) {
            return Reject(Throw);
        }
        //If current is undefined and extensible is true, then
        if (current === undefined && extensible === true) {
            var isGenericDesc = IsGenericDescriptor(Desc);
            var isDataDesc = IsDataDescriptor(Desc);
            //If IsGenericDescriptor(Desc) or IsDataDescriptor(Desc) is true, then
            if (isGenericDesc === true || isDataDesc === true) {
                //Create an own data property named P of object O whose
                //[[Value]], [[Writable]], [[Enumerable]] and [[Configurable]]
                //attribute values are described by Desc.
                //If the value of an attribute field of Desc is absent,
                //the attribute of the newly created property is set to its default value.
                Object.defineProperty(O, P, Desc);
            } else {
                //Else, Desc must be an accessor Property Descriptor so,
                //Create an own accessor property named P of object O whose
                //[[Get]], [[Set]], [[Enumerable]] and [[Configurable]] attribute values are
                //described by Desc. If the value of an attribute field of Desc is absent,
                //the attribute of the newly created property is set to its default value.
                Object.defineProperty(O, P, Desc);
            }
            //Return true.
            return true;
        }
        //Return true, if every field in Desc is absent.
        var dataPropNames = Object.getOwnPropertyNames(Desc).sort();
        if (dataPropNames.length === 0) {
            return true;
        }
        //Return true, if every field in Desc also occurs
        //in current and the value of every field in Desc is the same value as the corresponding
        //field in current when compared using the SameValue algorithm (9.12).
        var currentPropNames = Object.getOwnPropertyNames(current).sort();
        if (currentPropNames.join() === dataPropNames.join()) {
            var same = true;
            for (var i = 0; i < currentPropNames.length; i++) {
                var field = currentPropNames[i];
                if (SameValue(Desc[field], current[field]) !== true) {
                    same = false;
                    break;
                }
            }
            if (same) {
                return true;
            }
        }
        //If the [[Configurable]] field of current is false then
        if (current.configurable === false) {
            //Reject, if the [[Configurable]] field of Desc is true.
            if (Desc.configurable === true) {
                return Reject(Throw);
            }
            //Reject, if the [[Enumerable]] field of Desc is present and the [[Enumerable]] fields
            //of current and Desc are the Boolean negation of each other.
            if (Desc.enumerable && Desc.enumerable !== current.enumerable) {
                return Reject(Throw);
            }
        }
        //If IsGenericDescriptor(Desc) is true, then no further validation is required.
        if (IsGenericDescriptor(Desc) === true) {} else if (IsDataDescriptor(current) !== IsDataDescriptor(Desc)) {
            //Else, if IsDataDescriptor(current) and IsDataDescriptor(Desc) have different results,
            //then
            if (current.configurable === false) {
                //Reject, if the [[Configurable]] field of current is false.
                Reject(Throw);
            }
            //If IsDataDescriptor(current) is true, then
            if (IsDataDescriptor(current) === true) {
                //Convert the property named P of object O from a data property
                //to an accessor property.
                //Preserve the existing values of the converted property’s
                //[[Configurable]] and [[Enumerable]] attributes
                //and set the rest of the property’s attributes to their default values.
                var newProp = createAccessorProperty(undefined, undefined, current.enumerable, current.configurable);
                Object.defineProperty(O, P, newProp);
                //Else,
            } else {
                //Convert the property named P of object O from an accessor property to a data property.
                //Preserve the existing values of the converted property’s
                //[[Configurable]] and [[Enumerable]] attributes and
                //set the rest of the property’s attributes to their default values.
                var newProp = createDataProperty(undefined, undefined, current.enumerable, current.configurable);
                Object.defineProperty(O, P, newProp);
            }
            //Else, if IsDataDescriptor(current) and IsDataDescriptor(Desc) are both true, then	
        } else if (IsDataDescriptor(current) === true && IsDataDescriptor(Desc) === true) {
            //If the [[Configurable]] field of current is false, then
            if (current.configurable === false) {
                //Reject, if the [[Writable]] field of current is false
                //and the [[Writable]] field of Desc is true.
                if (current.writable === false && Desc.writable === true) {
                    return Reject(Throw);
                }
                //If the [[Writable]] field of current is false, then
                if (current.writable === false) {
                    //Reject, if the [[Value]] field of Desc is present and
                    //SameValue(Desc.[[Value]], current.[[Value]]) is false.
                    if (Desc.value && SameValue(Desc.value, current.value)) {
                        return Reject(Throw);
                    }
                }
                //else, the [[Configurable]] field of current is true, so any change is acceptable.
            }
            //Else, IsAccessorDescriptor(current) and IsAccessorDescriptor(Desc) are both true so,
        } else if (IsAccessorDescriptor(current) === true && IsAccessorDescriptor(Desc) === true) {
            //If the [[Configurable]] field of current is false, then
            if (current.configurable === false) {
                //Reject, if the [[Set]] field of Desc is present
                //and SameValue(Desc.[[Set]], current.[[Set]]) is false.
                if (Desc["set"] && SameValue(Desc["set"], current["set"]) === true) {
                    return Reject(Throw);
                }
                //Reject, if the [[Get]] field of Desc is present and
                //SameValue(Desc.[[Get]], current.[[Get]]) is false.
                if (Desc["get"] && SameValue(Desc["get"], current["get"]) === true) {
                    return Reject(Throw);
                }
            }
        }
        //For each attribute field of Desc that is present, set the correspondingly named attribute
        //of the property named P of object O to the value of the field.
        Object.defineProperty(O, P, Desc);
        //Return true.
        return true;
        //However, if O is an Array object, it has a more elaborate [[DefineOwnProperty]]
        //internal method defined in 15.4.5.1.
        //NOTE Step 10.b allows any field of Desc to be different from the corresponding field of
        //current if current’s [[Configurable]] field is true.
        //This even permits changing the [[Value]] of a property whose [[Writable]] attribute is
        //false. This is allowed because a true [[Configurable]] attribute would permit an
        //equivalent sequence of calls where [[Writable]] is first set to true, a new [[Value]] is
        //set, and then [[Writable]] is set to false.
    }
    /*
	9.1 ToPrimitive # Ⓣ 
	The abstract operation ToPrimitive takes an input argument 
	and an optional argument PreferredType. The abstract operation ToPrimitive converts its input argument
	to a non-Object type. If an object is capable of converting to more than one primitive type, it may use
	the optional hint PreferredType to favour that type. 
	Conversion occurs according to Table 10:
	*/
    function ToPrimitive(input, PreferredType) {
        var inputType = Type(input)
        //Undefined: The result equals the input argument (no conversion).
        //Null: The result equals the input argument (no conversion).
        //Boolean: The result equals the input argument (no conversion).
        //Number: The result equals the input argument (no conversion).
        //String: The result equals the input argument (no conversion).
        //Object
        if (inputType === "Object") {
            //Return a default value for the Object.
            //The default value of an object is retrieved by calling the [[DefaultValue]] internal
            //method of the object, passing the optional hint PreferredType.
            //The behaviour of the [[DefaultValue]] internal method is defined
            //by this specification for all native ECMAScript objects in 8.12.8.
            return DefaultValue(input, PreferredType)
        }
        return input;
    }
    /*
	9.2 ToBoolean # Ⓣ 
	The abstract operation ToBoolean converts its argument to a value of type Boolean according to 
	Table 11:
	*/
    function ToBoolean(x) {
        var xType = Type(x);
        //Undefined false
        //Null false
        if (xType === "Undefined" || xType === "Null") {
            return false;
        }
        //Boolean The result equals the input argument (no conversion).
        if (xType === "Boolean") {
            return x;
        }
        //Number
        //The result is false if the argument is +0, −0, or NaN; otherwise the result is true.
        if (xType === "Number") {
            if (1 / x === Infinity || 1 / x === -Infinity || x === NaN) {
                return false;
            }
            return true;
        }
        //String
        //The result is false if the argument is the empty String (its length is zero);
        //otherwise the result is true.
        if (xType === "String") {
            if (x.length === 0) {
                return false;
            }
            return true;
        }
        //Object true
        if (xType === "String") {
            return true;
        }
    }
    /*
	9.3 ToNumber # Ⓣ 
	The abstract operation ToNumber converts its argument to a value of type Number according to Table 12:
	*/
    function ToNumber(x) {
        var xType = Type(x)
        // Undefined NaN
        if (xType === "Undefined") {
            return NaN;
        }
        //Null  +0
        if (xType === "Null") {
            return +0;
        }
        //Boolean
        //The result is 1 if the argument is true. The result is +0 if the argument is false.
        if (xType === "Boolean") {
            if (x) {
                return 1;
            }
            return +0;
        }
        //Number
        //The result equals the input argument (no conversion).
        if (xType === "Number") {
            return x;
        }
        //String
        //See grammar and note below.
        if (xType === "String") {
            //taking a shortcut here
            var valueOf = Number.valueOf();
            //effectively runts the "ToNumber Applied to the String Type" algorithm:
            return valueOf(x);
        }
        //Object
        //Apply the following steps:
        if (xType === "object") {
            //Let primValue be ToPrimitive(input argument, hint Number).
            var primValue = ToPrimitive(x, "Number");
            //Return ToNumber(primValue).
            return ToNumber(primValue);
        }
    }
    //toNumber
    /*
	9.4 ToInteger # Ⓣ 
	The abstract operation ToInteger converts its argument to an integral numeric value. This abstract operation functions as follows:
	*/
    function ToInteger(x) {
        //Let number be the result of calling ToNumber on the input argument.
        var number = ToNumber(x);
        //If number is NaN, return +0.
        if (number === NaN) {
            return +0;
        }
        //If number is +0, −0, +∞, or −∞, return number.
        if (number === 0 || number === Infinity || number === -Infinity) {
            return number;
        }
        //Return the result of computing sign(number) * floor(abs(number)).
        var result = sign(number) * Math.floor(Math.abs(number));
        return result;
    }
    /*
	The mathematical function sign(x) yields 1 if x is positive and −1 if x is negative. 
	The sign function is not used in this standard for cases when x is zero.
	*/
    function sign(x) {
        if (x === 0) {
            throw Error("The sign function is not used in this standard for cases when x is zero.")
        }
        if (x > 0) {
            return 1;
        }
        return -1;
    }
    /*
	9.5 ToInt32: (Signed 32 Bit Integer) # Ⓣ 
	The abstract operation ToInt32 converts its argument to one of 232 integer values in the range −231 through 231−1, inclusive. This abstract operation functions as follows:
	*/
    function ToInt32(x) {
        //Let number be the result of calling ToNumber on the input argument.
        var number = ToNumber(x);
        //If number is NaN, +0, −0, +∞, or −∞, return +0.
        if (number === NaN || number === 0 || number === Infinity || number === -Infinity) {
            return +0;
        }
        //Let posInt be sign(number) * floor(abs(number)).
        var posInt = sign(number) * Math.floor(Math.abs(number))
        //Let int32bit be posInt modulo 232; that is, a finite integer value k of
        //Number type with positive sign and less than
        //232 in magnitude such that the mathematical difference of
        //posInt and k is mathematically an integer multiple of 232.
        var n = Math.pow(2, 32);
        var int32bit = ((posInt % n) + n) % n;
        //If int32bit is greater than or equal to 231,
        if (int32bit >= Math.pow(2, 31)) {
            //return int32bit − 2^32,
            return int32bit - Math.pow(2, 32)
        }
        //otherwise return int32bit.
        return int32bit;
        /*
		NOTE Given the above definition of ToInt32:
		
		The ToInt32 abstract operation is idempotent: if applied to a result that it produced,
		the second application leaves that value unchanged.
		ToInt32(ToUint32(x)) is equal to ToInt32(x) for all values of x. 
		(It is to preserve this latter property that +∞ and −∞ are mapped to +0.)
		ToInt32 maps −0 to +0.
		*/
    }
    /*
	9.6 ToUint32: (Unsigned 32 Bit Integer) # Ⓣ 
	The abstract operation ToUint32 converts its argument to one of 232 integer values in the 
	range 0 through 232−1, inclusive. This abstraction operation functions as follows:
	*/
    function ToUint32(x) {
        //Let number be the result of calling ToNumber on the input argument.
        var number = ToNumber(x);
        //If number is NaN, +0, −0, +∞, or −∞, return +0.
        if (number === NaN || number === 0 || number === Infinity || number === -Infinity) {
            return +0;
        }
        //Let posInt be sign(number) * floor(abs(number)).
        var posInt = sign(number) * Math.floor(Math.abs(number))
        //Let int32bit be posInt modulo 232; that is, a finite integer value k of Number type with
        //positive sign and less than 232 in magnitude such that the mathematical difference of
        //posInt and k is mathematically an integer multiple of 232.
        var n = Math.pow(2, 32);
        var int32bit = ((posInt % n) + n) % n;
        //Return int32bit.
        return int32bit
        /*
		NOTE Given the above definition of ToUInt32:
		Step 5 is the only difference between ToUint32 and ToInt32.
		The ToUint32 abstract operation is idempotent: if applied to a result that it produced, 
		the second application leaves that value unchanged.
		ToUint32(ToInt32(x)) is equal to ToUint32(x) for all values of x. 
		(It is to preserve this latter property that +∞ and −∞ are mapped to +0.)
		ToUint32 maps −0 to +0.
		*/
    }
    /*
	9.7 ToUint16: (Unsigned 16 Bit Integer) # Ⓣ 
	The abstract operation ToUint16 converts its argument to one of 216 integer values in the 
	range 0 through 216−1, inclusive. This abstract operation functions as follows:
	*/
    function ToUint16(x) {
        //Let number be the result of calling ToNumber on the input argument.
        var number = ToNumber(x);
        //If number is NaN, +0, −0, +∞, or −∞, return +0.
        if (number === NaN || number === 0 || number === Infinity || number === -Infinity) {
            return +0;
        }
        //Let posInt be sign(number) * floor(abs(number)).
        var posInt = sign(number) * Math.floor(Math.abs(number))
        //Let int16bit be posInt modulo 216; that is, a finite integer value k of Number type with
        //positive sign and less than 216 in magnitude such that the mathematical difference of
        //posInt and k is mathematically an integer multiple of 216.
        var n = Math.pow(2, 16);
        var int16bit = ((posInt % n) + n) % n;
        //Return int16bit.
        return int16bit;
        /*
		NOTE Given the above definition of ToUint16:
		The substitution of 216 for 232 in step 4 is the only difference between ToUint32 and ToUint16.
		ToUint16 maps −0 to +0.
		*/
    }
    /*
	9.8 ToString # Ⓣ 
	The abstract operation ToString converts its argument to a value of type 
	String according to Table 13:
	*/
    function ToString(x) {
        var xType = Type(x)
        //Undefined "Undefined"
        //Null "Null"
        if (xType === "Undefined" || xType === "Null") {
            return xType;
        }
        //Boolean
        if (xType === "Boolean") {
            //If the argument is true, then the result is "true".
            //If the argument is false, then the result is "false".
            if (x === true) {
                return "true"
            }
            return "false";
        }
        //Number See 9.8.1. (ToString Applied to the Number Type)
        if (xType === "Number") {
            return toStringAppledToTheNumberType(x);
        }
        //String
        //Return the input argument (no conversion)
        if (xType === "String") {
            return x;
        }
        //Must be an Object
        //Apply the following steps:
        //1. Let primValue be ToPrimitive(input argument, hint String).
        var primValue = ToPrimitive(x, "String");
        //2. Return ToString(primValue).
        return ToString(primValue);
    }
    //ToString Applied to the Number Type
    function toStringAppledToTheNumberType(m) {
        //If m is NaN, return the String "NaN".
        if (m === NaN) {
            return "NaN";
        }
        //If m is +0 or −0, return the String "0".
        if (m === 0) {
            return "0";
        }
        //If m is less than zero, return the String concatenation of the String "-" and ToString(−m).
        if (m < 0) {
            return "-" + ToString(-m);
        }
        //If m is infinity, return the String "Infinity".
        if (m === Infinity) {
            return "Infinity";
        }
        //Otherwise, let n, k, and s be integers such that k ≥ 1, 10k−1 ≤ s < 10k, the Number value for s × 10n−k is m, and k is as small as possible. Note that k is the number of digits in the decimal representation of s, that s is not divisible by 10, and that the least significant digit of s is not necessarily uniquely determined by these criteria.
        //If k ≤ n ≤ 21, return the String consisting of the k digits of the decimal representation of s (in order, with no leading zeroes), followed by n−k occurrences of the character ‘0’.
        //If 0 < n ≤ 21, return the String consisting of the most significant n digits of the decimal representation of s, followed by a decimal point ‘.’, followed by the remaining k−n digits of the decimal representation of s.
        //If −6 < n ≤ 0, return the String consisting of the character ‘0’, followed by a decimal point ‘.’, followed by −n occurrences of the character ‘0’, followed by the k digits of the decimal representation of s.
        //Otherwise, if k = 1, return the String consisting of the single digit of s, followed by lowercase character ‘e’, followed by a plus sign ‘+’ or minus sign ‘−’ according to whether n−1 is positive or negative, followed by the decimal representation of the integer abs(n−1) (with no leading zeros).
        //Return the String consisting of the most significant digit of the decimal representation of s, followed by a decimal point ‘.’, followed by the remaining k−1 digits of the decimal representation of s, followed by the lowercase character ‘e’, followed by a plus sign ‘+’ or minus sign ‘−’ according to whether n−1 is positive or negative, followed by the decimal representation of the integer abs(n−1) (with no leading zeros)
        //Not even going to bother!!!
        return m.toString();
    }
    //The abstract operation ToObject converts its argument to a value of type Object according
    //to Table 14: http://es5.github.com/#x9.9
    function ToObject(argument) {
        var result;
        //Undefined: Throw a TypeError exception.
        //Null: Throw a TypeError exception.
        if (argument === undefined || argument === null) {
            throw TypeError;
        }
        var type = Type(argument);
        //Boolean:
        switch (type) {
        case "Boolean":
            //Create a new Boolean object whose [[PrimitiveValue]] internal property is set
            //to the value of the argument. See 15.6 for a description of Boolean objects.
            var result = new Boolean(argument);
            break;
        case "Number":
            //Number
            //Create a new Number object whose [[PrimitiveValue]] internal property is set
            //to the value of the argument. See 15.7 for a description of Number objects.
            result = new Number(argument);
            break;
        case "String":
            //String	
            //Create a new String object whose [[PrimitiveValue]] internal property is set to the
            //value of the argument. See 15.5 for a description of String objects.
            result = new String(argument);
            break;
        case "Object":
            //Object
            //The result is the input argument (no conversion).
            result = argument;
            break;
        }
        return result;
    }
    //ToObject()
    /*
	9.10 CheckObjectCoercible
	The abstract operation CheckObjectCoercible throws an error if its argument is a value that 
	cannot be converted to an Object using ToObject. It is defined by Table 15:
	*/
    function CheckObjectCoercible(argument) {
        var result;
        //Undefined: Throw a TypeError exception.
        //Null: Throw a TypeError exception.
        if (argument === undefined || argument === null) {
            throw TypeError;
        }
        //Boolean, Number, String, Object,
        return
    }
    //CheckObjectCoercible
    /*
	9.11 IsCallable
	The abstract operation IsCallable determines if its argument, which must be an
	ECMAScript language value, is a callable function Object according to Table 16:
	*/
    function IsCallable(argument) {
        //Undefined Return false.
        //Null Return false.
        //Boolean Return false.
        //NumberReturn false.
        //String Return false.
        //Object If the argument object has an [[Call]] internal method, then return true,
        //otherwise return false.
        if (typeof argument === "function" && typeof argument.call === "function") {
            return true;
        }
        return false;
    }
    // isCallable
    /*
	9.12 The SameValue Algorithm # Ⓣ 
	The internal comparison abstract operation SameValue(x, y), where x and y are 
	ECMAScript language values, produces true or false. 
	Such a comparison is performed as follows:
	*/
    function SameValue(x, y) {
        var xType = Type(x);
        var yType = Type(y);
        //If Type(x) is different from Type(y), return false.
        if (xType !== yType) {
            return false;
        }
        //If Type(x) is Undefined, return true.
        //If Type(x) is Null, return true.
        if (xType === "Undefined" || xType === "Null") {
            return true;
        }
        //If Type(x) is Number, then.
        if (xType === "Number") {
            //If x is NaN and y is NaN, return true.
            if (isNaN(x) && isNaN(y)) {
                return true;
            }
            //If x is +0 and y is -0, return false.
            if (1 / x === Infinity && 1 / y === -Infinity) {
                return false;
            }
            //If x is -0 and y is +0, return false.
            if (1 / x === -Infinity && 1 / y === Infinity) {
                return false;
            }
            //If x is the same Number value as y, return true.
            //Return false.
            return (x === y);
        }
        //If Type(x) is String,
        if (xType === "String") {
            //then return true if x and y are exactly the same sequence
            //of characters (same length and same characters in corresponding positions);
            //otherwise, return false.
            return (x === y);
        }
        //If Type(x) is Boolean,
        if (xType === "Boolean") {
            //return true if x and y are both true or both false; otherwise, return false.
            return (x === y);
        }
        //Return true if x and y refer to the same object. Otherwise, return false.
        return (x === y);
    }

    function Call(F, thisArg, args) {
        /*
		13.2.1 [[Call]] # Ⓣ 
		When the [[Call]] internal method for a Function object F is called with a 
		this value and a list of arguments, the following steps are taken:
		*/
        //Let funcCtx be the result of establishing a new execution context for function code using
        //the value of F's [[FormalParameters]] internal property, the passed arguments List args,
        //and the this value as described in 10.4.3.
        //Let result be the result of evaluating the FunctionBody that is the value
        //of F's [[Code]] internal property. If F does not have a [[Code]] internal property
        //or if its value is an empty FunctionBody,
        //then result is (normal, undefined, empty).
        //Exit the execution context funcCtx, restoring the previous execution context.
        //If result.type is throw then throw result.value.
        //If result.type is return then return result.value.
        //Otherwise result.type must be normal. Return undefined.
        return F.call(thisArg, args);
    }

    function Type(x) {
        //correct for null being returned as "Object"
        var type = (x === null) ? "null" : typeof x;
        if (type === "function") {
            //correct for function being an Object
            type = "Object";
        } else {
            //uppercase first letter
            type = type.charAt(0).toUpperCase() + type.slice(1);
        }
        return type;
    }

    function Construct(F, args) {
        /*
		13.2.2 [[Construct]]
		When the [[Construct]] internal method for a Function object F is called with a possibly empty list of arguments, 
		the following steps are taken:
		*/
        //Let obj be a newly created native ECMAScript object.
        var obj = {};
        //Set all the internal methods of obj as specified in 8.12.
        var internalMethods = [DefineOwnProperty, GetOwnProperty, GetProperty, Get, CanPut, Put, HasProperty, Delete, DefaultValue];
        for (var i = 0; i < internalMethods; i++) {
            var method = internalMethods[i];
            var internalFunc = function () {
                    Call(method, obj, arguments)
                }
            var props = createDataProperty(internalFunc);
            if (obj.hasOwnProperty("DefineOwnProperty")) {
                obj.DefineOwnProperty(obj, method.name, props, false);
                continue;
            }
            Object.defineProperty(obj, method.name, props);
        }
        //Set the [[Class]] internal property of obj to "Object".
        var classProps = createAccessorProperty(function () {
            return "Object"
        });
        obj.DefineOwnProperty(obj, "Class", classProps, false);
        //Set the [[Extensible]] internal property of obj to true.
        //don't need to do anything here. 
        //Let proto be the value of calling the [[Get]] internal property of F with argument "prototype".
        var proto = Get(F, "prototype");
        //If Type(proto) is Object, set the [[Prototype]] internal property of obj to proto.
        var protoType = Type(proto);
        if (protoType === "Object") {
            obj.proto = proto;
        }
        //If Type(proto) is not Object, set the [[Prototype]] internal property of obj to the standard built-in Object prototype object as described in 15.2.4.
        if (protoType !== "Object") {
            //(The value of the [[Prototype]] internal property of the Object prototype object is null, the value of the [[Class]] internal property is "Object", and the initial value of the [[Extensible]] internal property is true.)
        }
        //Let result be the result of calling the [[Call]] internal property of F, 
        //providing obj as the this value and providing the argument list passed into [[Construct]] as args.
        var result = Call(F, obj, args)
        //If Type(result) is Object then return result.
        if (Type(result) === "Object") {
            return result;
        }
        //Return obj.
        return obj;
    }
})();