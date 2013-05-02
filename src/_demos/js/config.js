/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function (config) {
    // Define changes to default configuration here.
    // For the complete reference:
    // http://docs.ckeditor.com/#!/api/CKEDITOR.config

    // The toolbar groups arrangement, optimized for a single toolbar row.
    config.toolbarGroups = [
		// On the basic preset, clipboard and undo is handled by keyboard.
		// Uncomment the following line to enable them on the toolbar as well.
		// { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
		{ name: 'forms' },
		{ name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
		{ name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align'] },
		{ name: 'styles' },
		{ name: 'colors' }
    ];

    // The default plugins included in the basic setup define some buttons that
    // we don't want too have in a basic editor. We remove them here.
    config.removeButtons = 'Anchor,Subscript,Superscript';

    // Considering that the basic setup doesn't provide pasting cleanup features,
    // it's recommended to force everything to be plain text.
    config.forcePasteAsPlainText = true;

    // Let's have it basic on dialogs as well.
    config.removeDialogTabs = 'link:advanced';

};
