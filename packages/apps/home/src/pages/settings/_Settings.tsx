import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { createSignal, onMount } from "solid-js";

import { useLoadUserConfig, useSetAction, useSetError, useUserConfig } from "../../store";
import { PathSelector } from "./_PathSelector";
import Styles from "./Settings.module.less";

interface Path {
	value?: string;
	valid: boolean;
}

interface DcsPaths {
	install: Path;
	savedGames: Path;
}

export const Settings = () => {
	const userConfig = useUserConfig();
	const setError = useSetError();
	const setAction = useSetAction();
	const loadUserConfig = useLoadUserConfig();
	const [withoutLocalDCS, setWithoutLocalDCS] = createSignal(false);

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
		<div class={Styles.content}>
			<div class={Styles.wrapper}>
				<h2 class={Styles.title}>Settings</h2>
				<Components.Switch
					checked={withoutLocalDCS()}
					onChange={(value) => setWithoutLocalDCS(value)}
					class={Styles.switch}
				>
					Use without local DCS Installation(Server)
				</Components.Switch>
				<PathSelector
					label="DCS Installation Directory"
					value={dcsPaths().install}
					onChange={onChangeInstall}
					disabled={withoutLocalDCS()}
				/>
				<PathSelector
					label="DCS Saved Games Directory"
					value={dcsPaths().savedGames}
					onChange={onChangeSavedGames}
					disabled={withoutLocalDCS()}
				/>
				<PathSelector label="Downloads" value={downloadsPath()} onChange={onChangeDownloads} />
				<div class={Styles.buttons}>
					<Components.Button
						disabled={!dcsPaths().install.valid || !dcsPaths().savedGames.valid || !downloadsPath().valid}
						onPress={onContinue}
						large
					>
						{userConfig?.dcs?.available ? "Save" : "Continue"}
					</Components.Button>
				</div>
			</div>
		</div>
	);
};
