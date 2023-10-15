import * as Path from "node:path";

import chokidar from "chokidar";
import esbuild from "esbuild";

export async function watchBuild({ options, onRebuildStart, onRebuildEnd }) {
	options.metafile = true;
	const context = await esbuild.context(options);

	const { metafile } = await context.rebuild();

	let inputs = getInputs(metafile.inputs);

	const watcher = chokidar.watch([...inputs], { ignoreInitial: true });

	watcher.on("all", async () => {
		const t0 = Date.now();
		try {
			onRebuildStart?.();
			const newBuildResult = await context.rebuild();
			const newInputs = getInputs(newBuildResult.metafile.inputs);
			const diff = getSetDiff(inputs, newInputs);
			inputs = newInputs;
			watcher.add(diff.added);
			watcher.unwatch(diff.removed);
			onRebuildEnd?.({ time: Date.now() - t0 });
		} catch (error) {
			onRebuildEnd?.({ error, time: Date.now() - t0 });
		}
	});
}

function getInputs(inputs) {
	return new Set(
		Object.keys(inputs)
			.filter((input) => !input.includes("node_modules"))
			.map((input) => Path.resolve(input)),
	);
}

function getSetDiff(old, current) {
	const added = [];
	const removed = [];

	for (const entry of current) {
		if (!old.has(entry)) {
			added.push(entry);
		}
	}

	for (const entry of old) {
		if (!current.has(entry)) {
			removed.push(entry);
		}
	}

	return { added, removed };
}

export async function watchFiles({ watch, paths, onChange }) {
	await onChange(false);
	if (watch) {
		chokidar.watch(paths, { ignoreInitial: true }).on("all", () => {
			// wait to ensure write has been finished
			setTimeout(() => {
				onChange(true);
			}, 100);
		});
	}
}
