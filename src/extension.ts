import * as vscode from "vscode";
import * as CryptoJS from "crypto-js";

export function activate(context: vscode.ExtensionContext) {
  let encryptDisposable = vscode.commands.registerCommand(
    "encrypt.file",
    async () => {
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
    }
  );

  let decryptDisposable = vscode.commands.registerCommand(
    "decrypt.file",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const encryptedText = document.getText();

        const password = "cat123";
        let decrypted = "";
        try {
          const bytes = CryptoJS.AES.decrypt(encryptedText, password);
          decrypted = bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
          vscode.window.showErrorMessage(
            "Failed to decrypt the file. It might not be encrypted with the correct password."
          );
          return;
        }

        await editor.edit((editBuilder) => {
          const start = new vscode.Position(0, 0);
          const end = new vscode.Position(
            document.lineCount - 1,
            document.lineAt(document.lineCount - 1).text.length
          );
          editBuilder.replace(new vscode.Range(start, end), decrypted);
        });
      }
    }
  );

  context.subscriptions.push(encryptDisposable);
  context.subscriptions.push(decryptDisposable);
}

export function deactivate() {}
