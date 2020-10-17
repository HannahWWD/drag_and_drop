// autoBind decorator
// using _var ,means to tell TS that you will not use the var, but just need to pass them in the parameters
export function AutoBind(
    _target: any,
    _propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
      configurable: true,
      enumerable: false,
      // getter function, which won't be overwritten by the addEventListener function
      get() {
        const boundFn = originalMethod.bind(this);
        return boundFn;
      },
    };
    return adjustedDescriptor;
  }
  