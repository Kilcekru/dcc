export type DeepReadonly<T> = T extends (infer R)[]
	? ReadonlyArray<DeepReadonly<R>>
	: T extends object
	? {
			readonly [P in keyof T]: DeepReadonly<T[P]>;
	  }
	: T;
