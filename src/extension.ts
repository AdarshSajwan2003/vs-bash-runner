import * as vscode from 'vscode';
import { exec } from 'child_process';
// export function activate(context: vscode.ExtensionContext) {
export function activate(context: vscode.ExtensionContext) {
	const bashRunner = new BashRunner(context);
	bashRunner.init();
}
class BashRunner {
	toggleFlag: boolean = false;
	statusBarItems: vscode.StatusBarItem[] = [];
	commands: {} = {};
	limit: number = 5;
	constructor(private context: vscode.ExtensionContext) {}
	init() {
		const t = this.toggle.bind(this);
		this.context.subscriptions.push(vscode.commands.registerCommand('vs-bash-runner.toggle', t));

		const s = this.start.bind(this);
		this.context.subscriptions.push(vscode.commands.registerCommand('vs-bash-runner.start', s));

		const st = this.stop.bind(this);
		this.context.subscriptions.push(vscode.commands.registerCommand('vs-bash-runner.stop', st));

		const r = this.refresh.bind(this);
		this.context.subscriptions.push(vscode.commands.registerCommand('vs-bash-runner.refresh', r));

		for (let i = 0; i < this.limit; i++) {
			const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
			statusBarItem.text = `B: ${i}`;
			this.statusBarItems.push(statusBarItem);
			this.context.subscriptions.push(statusBarItem);
		}

		const config = vscode.workspace.getConfiguration('vs-bash-runner');
		this.commands = config.get('bashCommands') || {};
	}
	start() {
		console.log("commands: ", this.commands);
		let i = 0;
		for (let [key, value] of Object.entries(this.commands)) {
			if (i >= this.limit) {
				break;
			}
			setInterval(() => {
				exec(value as string, (error, stdout, stderr) => {
					if (error) {
						console.error(`exec error: ${error}`);
						return;
					}
					this.statusBarItems[i].text = `${key}: ${stdout.trim()}`;
					this.statusBarItems[i].show();
				});
			}, 5000); // Execute every 5 seconds
			i++;
		}
		vscode.window.showInformationMessage('Hello from Start!');
	}
	stop() {
		for (let i = 0; i < this.limit; i++) {
			this.statusBarItems[i]?.hide();
		}
		vscode.window.showInformationMessage('Hello from Stop!');
	}
	toggle() {
		this.toggleFlag = !this.toggleFlag;
		if (this.toggleFlag) {
			vscode.commands.executeCommand('vs-bash-runner.start');
		} else {
			vscode.commands.executeCommand('vs-bash-runner.stop');
		}
		vscode.window.showInformationMessage(`Hello from Toggle: ${this.toggleFlag}`);
	}	
	refresh() {
		const config = vscode.workspace.getConfiguration('vs-bash-runner');
		this.commands = config.get('bashCommands') || {};
		vscode.commands.executeCommand('vs-bash-runner.stop');
		setTimeout(() => {
			vscode.commands.executeCommand('vs-bash-runner.start');
		}, 1500);
		vscode.window.showInformationMessage('Hello from Refresh!');
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
