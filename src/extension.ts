import * as vscode from "vscode";
import * as CryptoJS from "crypto-js";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("encrypt.file", async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const text = document.getText();

      const password = "cat123";
      const encrypted = CryptoJS.AES.encrypt(text, password).toString();

      await editor.edit((editBuilder) => {
        const start = new vscode.Position(0, 0);
        const end = new vscode.Position(
          document.lineCount - 1,
          document.lineAt(document.lineCount - 1).text.length
        );
        editBuilder.replace(new vscode.Range(start, end), encrypted);
      });
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
