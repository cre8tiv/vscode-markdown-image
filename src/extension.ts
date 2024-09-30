import * as vscode from 'vscode';
import axios from 'axios';
require('dotenv').config();

interface UnsplashImagePickItem extends vscode.QuickPickItem {
    imageUrl: string;
}

const config = vscode.workspace.getConfiguration();
export let accessKey = config.get('unsplash.accessKey') || process.env.UNSPLASH_ACCESS_KEY;

export async function searchUnsplash(query: string) {
    if (!accessKey) {
        vscode.window.showErrorMessage('Unsplash API key is not set in settings.');
        return;
    }

    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
        params: {
            query: query,
            client_id: accessKey
        }
    });
    return response.data.results;
}

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('extension.searchUnsplash', async () => {
        const query = await vscode.window.showInputBox({
            placeHolder: 'Search Unsplash for an image'
        });

        if (query) {
            const images = await searchUnsplash(query);
            if (!images || images.length === 0) {
                vscode.window.showErrorMessage('No images found');
                return;
            }
            const selectedImage = await vscode.window.showQuickPick<UnsplashImagePickItem>(
                images.map((image: any): UnsplashImagePickItem => ({
                    label: image.description || 'No description',
                    detail: image.urls.small,
                    imageUrl: image.urls.raw
                })),
                { placeHolder: 'Select an image to insert' }
            );

            if (selectedImage) {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const imageMarkdown = `![${selectedImage.label}](${selectedImage.imageUrl})`;
                    editor.edit(editBuilder => {
                        editBuilder.insert(editor.selection.active, imageMarkdown);
                    });
                }
            }
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
