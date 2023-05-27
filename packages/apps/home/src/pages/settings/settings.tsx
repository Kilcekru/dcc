import { rpc } from "@kilcekru/dcc-lib-rpc";
import { createSignal, onMount } from "solid-js";

import { useLoadUserConfig, useSetAction, useSetError, useUserConfig } from "../../store";
import { PathSelector } from "./pathSelector";

export const Settings = () => {
	const userConfig = useUserConfig();
	const setError = useSetError();
	const setAction = useSetAction();
	const loadUserConfig = useLoadUserConfig();

	const [dcsPaths, setDcsPaths] = createSignal<DcsPaths>({ install: { valid: false }, savedGames: { valid: false } });
	const [downloadsPath, setDownloadsPaths] = createSignal<Path>({
		value: userConfig?.downloadsPath,
		valid: userConfig?.downloadsPath != undefined,
	});

	const onChangeInstall = async (path: string) => {
		const valid = await rpc.home.validateDcsInstallPath(path);
		setDcsPaths((paths) => ({
			install: {
				value: path,
				valid,
			},
			savedGames: paths.savedGames,
		}));
	};

	const onChangeSavedGames = async (path: string) => {
		const valid = await rpc.home.validateDcsSavedGamesPath(path);
		setDcsPaths((paths) => ({
			install: paths.install,
			savedGames: {
				value: path,
				valid,
			},
		}));
	};

	const onChangeDownloads = async (path: string) => {
		const valid = await rpc.home.validateDirectoryPath(path);
		setDownloadsPaths({
			value: path,
			valid,
		});
	};

	const onContinue = async () => {
		try {
			const paths = dcsPaths();
			if (
				!userConfig?.dcs?.available ||
				paths.install.value !== userConfig?.dcs?.paths.install ||
				paths.savedGames.value !== userConfig?.dcs?.paths.savedGames
			) {
				if (
					paths.install.valid &&
					paths.install.value != undefined &&
					paths.savedGames.valid &&
					paths.savedGames.value != undefined
				) {
					await rpc.home.setDcsPaths({ install: paths.install.value, savedGames: paths.savedGames.value });
				} else {
					await rpc.home.setDcsNotAvailable();
				}
			}
			const dPath = downloadsPath();
			if (dPath.value !== userConfig?.downloadsPath && dPath.valid && dPath.value != undefined) {
				await rpc.home.setDownloadsPath(dPath.value);
			}
			await loadUserConfig();
			setAction(undefined);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Unknown error";
			setError(new Error(`filePaths.onContinue failed: ${msg}`));
		}
	};

	onMount(async () => {
		if (userConfig?.dcs?.available) {
			setDcsPaths({
				install: { value: userConfig.dcs.paths.install, valid: true },
				savedGames: { value: userConfig.dcs.paths.savedGames, valid: true },
			});
		} else {
			try {
				const paths = await rpc.home.findDcsPaths();
				setDcsPaths({
					install: {
						value: paths.install,
						valid: paths.install != undefined,
					},
					savedGames: {
						value: paths.savedGames,
						valid: paths.savedGames != undefined,
					},
				});
			} catch (err) {
				console.error("err", err); // eslint-disable-line no-console
			}
		}
	});

	return (
		<div>
			<h2>DCS Directories</h2>
			<PathSelector description="DCS Installation Directory" value={dcsPaths().install} onChange={onChangeInstall} />
			<PathSelector
				description="DCS Saved Games Directory"
				value={dcsPaths().savedGames}
				onChange={onChangeSavedGames}
			/>
			<PathSelector description="Downloads" value={downloadsPath()} onChange={onChangeDownloads} />
			<div>
				<button
					disabled={!dcsPaths().install.valid || !dcsPaths().savedGames.valid || !downloadsPath().valid}
					onClick={onContinue}
				>
					Continue
				</button>
				<button disabled={!downloadsPath().valid} onClick={onContinue}>
					Continue without DCS
				</button>
			</div>
		</div>
	);
};

interface Path {
	value?: string;
	valid: boolean;
}

interface DcsPaths {
	install: Path;
	savedGames: Path;
}
