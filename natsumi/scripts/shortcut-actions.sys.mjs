/*

Natsumi Browser - A userchrome for Firefox and forks that makes things flow.

Copyright (c) 2024-present Green (@greeeen-dev)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

import {NatsumiNotification} from "./notifications.sys.mjs";
import * as ucApi from "chrome://userchromejs/content/uc_api.sys.mjs";

export class NatsumiShortcutActions {
    static copyCurrentUrl() {
        let currentUrl = gBrowser.currentURI.spec;
        navigator.clipboard.writeText(currentUrl);

        // Add to notifications
        let notificationObject = new NatsumiNotification("Copied URL to clipboard!", null, "chrome://natsumi/content/icons/lucide/copy.svg")
        notificationObject.addToContainer();
    }

    static toggleBrowserLayout() {
        let isSingleToolbar = false;
        if (ucApi.Prefs.get("natsumi.theme.single-toolbar").exists()) {
            isSingleToolbar = ucApi.Prefs.get("natsumi.theme.single-toolbar").value;
        }

        ucApi.Prefs.get("natsumi.theme.single-toolbar").value = !isSingleToolbar;
    }

    static toggleCompactMode() {
        if (document.body.attributes["natsumi-compact-mode"]) {
            document.body.removeAttribute("natsumi-compact-mode");
            document.body.removeAttribute("natsumi-compact-sidebar-extend");
            document.body.removeAttribute("natsumi-compact-navbar-extend");
        } else {
            document.body.setAttribute("natsumi-compact-mode", "");
        }
    }

    static toggleCompactSidebar() {
        if (!(document.body.hasAttribute("natsumi-compact-mode"))) {
            return;
        }

        if (document.body.hasAttribute("natsumi-compact-sidebar-extend")) {
            document.body.removeAttribute("natsumi-compact-sidebar-extend");
        } else {
            document.body.setAttribute("natsumi-compact-sidebar-extend", "");
        }
    }

    static toggleCompactNavbar() {
        if (!(document.body.hasAttribute("natsumi-compact-mode"))) {
            return;
        }

        if (document.body.hasAttribute("natsumi-compact-navbar-extend")) {
            document.body.removeAttribute("natsumi-compact-navbar-extend");
        } else {
            document.body.setAttribute("natsumi-compact-navbar-extend", "");
        }
    }
}