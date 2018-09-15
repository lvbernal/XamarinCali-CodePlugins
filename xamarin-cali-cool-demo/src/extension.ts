'use strict';

import * as vscode from 'vscode';
import * as http from 'http';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

    // This line of code will only be executed once when your extension is activated
    console.log('Now a real demo... Hope it works! :)');

    let disposable = vscode.commands.registerCommand('extension.askSimon', () => {
        let talker = new SimonTalker();
        talker.start();
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class SimonTalker {

    public start() {
        let context = this;
        let simonUrl = 'http://192.168.0.3:9999/result';
        http.get(simonUrl, (res) => { context.responseCallback(res, context); });
    }

    public responseCallback(res: http.IncomingMessage, context: SimonTalker) {

        // Return if there was an error
        if (res.statusCode !== 200) { return; }

        // Read response
        res.setEncoding('utf8');
        let rawData: string = '';
        res.on('data', (chunk: string) => rawData += chunk);

        // Finished reading response
        res.on('end', () => { context.processAndWrite(rawData); });
    }

    public processAndWrite(data: string) {
        let editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showInformationMessage('Open an editor and try again!');
            return;
        }

        let re = new RegExp('"', 'g');
        let validJson = data.replace(re, "'");
        re = new RegExp(', \'', 'g');
        validJson = validJson.replace(re, ",\n'");

        let variableName = "export const RESPONSEMOCK = ";
        let finalContent = variableName + validJson + ";\n";

        editor.edit((edit: vscode.TextEditorEdit) => {
            let pos = new vscode.Position(0,0);
            edit.insert(pos, finalContent);
        });
    }
}
