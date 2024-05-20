import * as vscode from "vscode";
import * as CryptoJS from "crypto-js";

function getPassword(): string | undefined {
  return process.env.FILE_PASSWORD;
}

const PREFIX = "ENCRYPTED___";

export function activate(context: vscode.ExtensionContext) {
  let encryptDisposable = vscode.commands.registerCommand(
    "encrypt.file",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const text = document.getText();

        if (text.substring(0, PREFIX.length) === PREFIX) {
          vscode.window.showErrorMessage("File already encrypted.");
          return;
        }
        const password = getPassword();
        if (!password) {
          vscode.window.showErrorMessage(
            "Environment variable FILE_PASSWORD is not defined."
          );
          return;
        }

        const encrypted =
          PREFIX + CryptoJS.AES.encrypt(text, password).toString();

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

        if (encryptedText.substring(0, PREFIX.length) !== PREFIX) {
          vscode.window.showErrorMessage("Only can decrypt an encrypted file");
          return;
        }

        const password = getPassword();
        if (!password) {
          vscode.window.showErrorMessage(
            "Environment variable FILE_PASSWORD is not defined."
          );
          return;
        }

        let decrypted = "";
        try {
          const bytes = CryptoJS.AES.decrypt(
            encryptedText.substring(PREFIX.length),
            password
          );
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
