// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

const workspacePath: string = vscode.workspace.workspaceFolders?.[0].uri.path || ''
const isAGem = !!fs.readdirSync(workspacePath).find(path => path.endsWith('.gemspec'))

function buildAppSpecPath(documentPath: string) {
  const path = documentPath.replace(/(\.rb$)/i, '_spec.rb').replace(/^app/i, 'spec')
  return path.startsWith('spec') ? path : `spec/${path}`
}

function buildGemSpecPath(documentPath: string) {
  return documentPath.replace(/(\.rb$)/i, '_spec.rb').replace(/^lib/i, 'spec')
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "rspec-quick-spec" is now active!');

  let disposable = vscode.commands.registerCommand('rspec-quick-spec.createSpec', async () => {
    const document = vscode.window.activeTextEditor?.document;
    const documentPath = vscode.workspace.asRelativePath(document?.uri.path || '')
    const extensionPath = vscode.extensions.getExtension('tatosjb.rspec-quick-spec')?.extensionPath;

    if (documentPath.match(/_spec\.rb$/i)) {
      vscode.window.showInformationMessage('Already a ruby spec');
      return
    }

    const specPath = isAGem ? buildGemSpecPath(documentPath) : buildAppSpecPath(documentPath)
    const newFileUri = vscode.Uri.file(`${workspacePath}/${specPath}`)
    const sampleUri = vscode.Uri.file(`${extensionPath}/file-samples/spec.rb`)

    if (fs.existsSync(newFileUri.fsPath)) {
      vscode.window.showInformationMessage('The file already exists, I`ll open it for you');
    } else {
      await vscode.workspace.fs.copy(sampleUri, newFileUri)
    }

    const specFile = await vscode.workspace.openTextDocument(newFileUri)
    vscode.window.showTextDocument(specFile)
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
