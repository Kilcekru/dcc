import { FileArgs, read, remove, write, WriteArgs } from "./utils";

export type WriteFileArgs = Omit<WriteArgs, "namespace">;
export async function writeFile(args: WriteFileArgs) {
	return await write({ ...args, namespace: "file" });
}

export type ReadFileArgs = Omit<FileArgs, "namespace">;
export async function readFile(args: ReadFileArgs) {
	return await read({ ...args, namespace: "file" });
}

export type RemoveFileArgs = Omit<FileArgs, "namespace">;
export async function removeFile(args: RemoveFileArgs) {
	return await remove({ ...args, namespace: "file" });
}
