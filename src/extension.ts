import * as vscode from 'vscode';
import { exec, ChildProcess } from 'child_process';
// export function activate(context: vscode.ExtensionContext) {
export function activate(context: vscode.ExtensionContext) {
	const bashRunner = new BashRunner(context);
	bashRunner.init();
}
export class BashRunner {
	toggleFlag: boolean = false;
	statusBarItems: vscode.StatusBarItem[] = [];
	commands: {} = {};
	limit: number = 5;
	constructor(private context: vscode.ExtensionContext) {
		process.on('exit', this.stopAll.bind(this));
		process.on('uncaughtException', this.stopAll.bind(this));
	}
	interval: Array<NodeJS.Timeout | null> = [];
	childProcess: Array<ChildProcess | null> = [];
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
	handleChildProcess(prevChild: ChildProcess | null, key: string, command: string, statusBarItem: vscode.StatusBarItem) {
		if (prevChild) {
			prevChild.kill();
		}
		const child = exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				return;
			}
			if (stderr) {
				console.error(`stderr: ${stderr}`);
				return;
			}
			statusBarItem.text = `${stdout.replace(/\n/g, '')}`;
			// console.log(`stdout: ${JSON.stringify(stdout.replace(/\n/g, ''))}`);
		});
		child.on('exit', (code, signal) => {
			console.log(`${command} exited with code ${code} and signal ${signal}`);
		});
		return child;
	}
	handleInterval(prevInterval: NodeJS.Timeout | null, key: string, command: string, statusBarItem: vscode.StatusBarItem, i: number) {
		if (prevInterval) {
			clearInterval(prevInterval);
		}
		const h = this.handleChildProcess.bind(this);
		const p = this.childProcess;
		let prevChild = h(null, key, command, statusBarItem);
		p[i] = prevChild;
		const interval = setInterval(() => {
			prevChild = h(prevChild, key, command, statusBarItem);
			p[i] = prevChild;
		}, 5000);
		return interval;
	}
	start() {
		// console.log("commands: ", this.commands);
		let i = 0;
		for (let [key, value] of Object.entries(this.commands)) {
			if (i >= this.limit) {
				break;
			}
			this.statusBarItems[i].text = `${key}: ${value}`;
			this.statusBarItems[i].show();
			const stbar = this.statusBarItems[i];
			const h = this.handleInterval.bind(this);
			this.interval[i] = h(this.interval[i], key as string, value as string, stbar, i);
			i++;
		}
		vscode.window.showInformationMessage('Bash Runner is Running!');
	}
	stopAll() {
		const p = this.childProcess;
		const it = this.interval;
		for (let i = 0; i < this.limit; i++) {
			if (it[i]) {
				clearInterval(it[i] as NodeJS.Timeout);
				it[i] = null;
			}
			if (p[i]) {
				p[i]?.kill();
				p[i] = null;
			}
		}
	}
	stop() {
		this.stopAll();
		for (let i = 0; i < this.limit; i++) {
			this.statusBarItems[i]?.hide();
		}
		vscode.window.showInformationMessage('Bash Runner has stop!');
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
		vscode.window.showInformationMessage('Bash Runner Refresh!');
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }
