import * as Components from "@kilcekru/dcc-lib-components";

import Styles from "./MissionOverlay.module.less";

export function PersistenceModal(props: { isOpen: boolean; onClose: () => void }) {
	return (
		<Components.Modal isOpen={props.isOpen} onClose={() => props.onClose()} class={Styles["help-modal"]}>
			<p>
				Change the following lines in the file <br />
				<strong>'DCS World/Scripts/MissionScripting.lua'</strong>
			</p>
			<p>From:</p>
			<p class={Styles["code-block"]}>
				do
				<br />
				sanitizeModule('os')
				<br />
				sanitizeModule('io')
				<br />
				sanitizeModule('lfs')
				<br />
				_G['require'] = nil
				<br />
				_G['loadlib'] = nil
				<br />
				_G['package'] = nil
				<br />
				end
			</p>
			<p>To:</p>
			<p class={Styles["code-block"]}>
				do
				<br />
				sanitizeModule('os')
				<br />
				<strong>
					--sanitizeModule('io')
					<br />
					--sanitizeModule('lfs')
					<br />
				</strong>
				_G['require'] = nil
				<br />
				_G['loadlib'] = nil
				<br />
				_G['package'] = nil
				<br />
				end
			</p>
		</Components.Modal>
	);
}
