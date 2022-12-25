export const optionalClass = (className: string, optionalClass?: string) => {
	return className + (optionalClass == null ? "" : " " + optionalClass);
};
