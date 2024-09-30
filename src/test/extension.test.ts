import * as assert from 'assert';
import * as vscode from 'vscode';
import * as myExtension from '../extension';
import axios from 'axios';
import sinon from 'sinon';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('searchUnsplash should return results', async () => {
		const query = 'nature';
		const mockResponse = {
			data: {
				results: [
					{
						description: 'A beautiful nature scene',
						urls: {
							small: 'https://example.com/small.jpg',
							raw: 'https://example.com/raw.jpg'
						}
					}
				]
			}
		};

		const axiosGetStub = sinon.stub(axios, 'get').resolves(mockResponse);

		const results = await myExtension.searchUnsplash(query);
		assert.strictEqual(results.length, 1);
		assert.strictEqual(results[0].description, 'A beautiful nature scene');

		axiosGetStub.restore();
	});

	test('searchUnsplash should handle no API key', async () => {
		const accessKeyStub = sinon.stub(myExtension, 'accessKey').value('');

		const showErrorMessageStub = sinon.stub(vscode.window, 'showErrorMessage');

		await myExtension.searchUnsplash('nature');
		assert.strictEqual(showErrorMessageStub.calledOnce, true);
		assert.strictEqual(showErrorMessageStub.firstCall.args[0], 'Unsplash API key is not set in settings.');

		showErrorMessageStub.restore();
		accessKeyStub.restore();
	});

	test('activate should register command', () => {
		const context: vscode.ExtensionContext = {
			subscriptions: [],
			workspaceState: {} as any,
			globalState: {} as any,
			extensionPath: '',
			asAbsolutePath: (relativePath: string) => '',
			storagePath: '',
			globalStoragePath: '',
			logPath: '',
			extensionUri: vscode.Uri.parse(''),
			environmentVariableCollection: {} as any,
			secrets: {} as any,
			storageUri: vscode.Uri.parse(''),
			globalStorageUri: vscode.Uri.parse(''),
			logUri: vscode.Uri.parse(''),
			extensionMode: vscode.ExtensionMode.Test,
			extension: {} as any,
			languageModelAccessInformation: {} as any, // Added missing property
		};

		myExtension.activate(context);

		const command = context.subscriptions.find(sub => (sub as any)._command === 'extension.searchUnsplash');
		assert.ok(command);
	});
});