/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { Component } from "react";

import { ClassicEditor } from "@ckeditor/ckeditor5-editor-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";

import * as CKBox from "ckbox";
import "ckbox/dist/styles/ckbox.css";

import format from "date-fns/format";
import ja from "date-fns/locale/ja";

import { commentEditorPlugins, plugins } from "./config-default";

export default class Editor extends Component {
  state = {
    // You need this state to render the <CKEditor /> component after the layout is ready.
    // <CKEditor /> needs HTMLElements of `Sidebar` and `PresenceList` plugins provided through the `config` property and you have to ensure that both are already rendered.
    isLayoutReady: false,
  };

  sidebarElementRef = React.createRef();
  presenceListElementRef = React.createRef();

  componentDidMount() {
    window.CKBox = CKBox;
    // When the layout is ready you can switch the state and render the `<CKEditor />` component.
    this.setState({ isLayoutReady: true });
  }

  render() {
    return (
      <div className="App">
        {this.renderHeader()}

        <main>
          <div className="message">
            <div className="centered">
              <h2>CKEditor 5 React integration of classic editor with real-time collaboration</h2>
              <p>Open this sample in another browser tab to start real-time collaborative editing.</p>
            </div>
          </div>

          <div className="centered">
            <div className="row-presence">
              <div ref={this.presenceListElementRef} className="presence"></div>
            </div>
            {this.renderEditor()}
          </div>
        </main>

        {this.renderFooter()}
      </div>
    );
  }

  renderHeader() {
    return (
      <header>
        <div className="centered">
          <h1>
            <a href="https://ckeditor.com/ckeditor-5/" target="_blank" rel="noopener noreferrer">
              <img src="https://c.cksource.com/a/1/logos/ckeditor5.svg" alt="CKEditor 5 logo" />
              CKEditor 5
            </a>
          </h1>

          <nav>
            <ul>
              <li>
                <a href="https://ckeditor.com/collaboration/" target="_blank" rel="noopener noreferrer">
                  Website
                </a>
              </li>
              <li>
                <a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/real-time-collaboration.html" target="_blank" rel="noopener noreferrer">
                  Documentation
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    );
  }

  renderEditor() {
    // You should contact CKSource to get the CloudServices configuration.
    const cloudServicesConfig = this.props.configuration;
    const initialData = this.props.initialData;

    return (
      <div className="row row-editor">
        {/* Do not render the <CKEditor /> component before the layout is ready. */}
        {this.state.isLayoutReady && (
          <CKEditor
            onReady={(editor) => {
              console.log("Editor is ready to use!", editor);

              // Switch between inline and sidebar annotations according to the window size.
              this.boundRefreshDisplayMode = this.refreshDisplayMode.bind(this, editor);
              // Prevent closing the tab when any action is pending.
              this.boundCheckPendingActions = this.checkPendingActions.bind(this, editor);

              window.addEventListener("resize", this.boundRefreshDisplayMode);
              window.addEventListener("beforeunload", this.boundCheckPendingActions);
              this.refreshDisplayMode(editor);
            }}
            onChange={(event, editor) => console.log({ event, editor })}
            editor={ClassicEditor}
            config={{
              plugins: plugins,
              toolbar: ["heading", "|", "fontsize", "fontfamily", "|", "bold", "italic", "underline", "strikethrough", "removeFormat", "highlight", "|", "alignment", "|", "numberedList", "bulletedList", "|", "undo", "redo", "|", "comment", "commentsArchive", "trackChanges", "|", "ckbox", "imageUpload", "link", "blockquote", "insertTable", "mediaEmbed"],
              cloudServices: {
                tokenUrl: cloudServicesConfig.tokenUrl,
                webSocketUrl: cloudServicesConfig.webSocketUrl,
              },
              collaboration: {
                channelId: cloudServicesConfig.channelId,
              },
              ckbox: {
                tokenUrl: cloudServicesConfig.ckboxTokenUrl || cloudServicesConfig.tokenUrl,
              },
              image: {
                toolbar: ["imageStyle:inline", "imageStyle:block", "imageStyle:side", "|", "toggleImageCaption", "imageTextAlternative", "|", "comment"],
              },
              table: {
                contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
                tableToolbar: ["comment"],
              },
              mediaEmbed: {
                toolbar: ["comment"],
              },
              sidebar: {
                container: this.sidebarElementRef.current,
              },
              presenceList: {
                container: this.presenceListElementRef.current,
              },
              comments: {
                editorConfig: {
                  extraPlugins: commentEditorPlugins,
                },
                formatDateTime: (date) => format(date, "yyyy/MM/dd", { locale: ja }),
              },
            }}
            data={initialData}
          />
        )}
        <div ref={this.sidebarElementRef} className="sidebar"></div>
      </div>
    );
  }

  renderFooter() {
    return (
      <footer>
        <div className="centered">
          <p>
            <a href="https://ckeditor.com/ckeditor-5/" target="_blank" rel="noopener noreferrer">
              CKEditor 5
            </a>
            – Rich text editor of tomorrow, available today
          </p>
          <p>
            Copyright © 2003-2023,
            <a href="https://cksource.com/" target="_blank" rel="noopener noreferrer">
              CKSource
            </a>
            Holding sp. z o.o. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  refreshDisplayMode(editor) {
    const annotationsUIs = editor.plugins.get("AnnotationsUIs");
    const sidebarElement = this.sidebarElementRef.current;

    if (window.innerWidth < 1070) {
      sidebarElement.classList.remove("narrow");
      sidebarElement.classList.add("hidden");
      annotationsUIs.switchTo("inline");
    } else if (window.innerWidth < 1300) {
      sidebarElement.classList.remove("hidden");
      sidebarElement.classList.add("narrow");
      annotationsUIs.switchTo("narrowSidebar");
    } else {
      sidebarElement.classList.remove("hidden", "narrow");
      annotationsUIs.switchTo("wideSidebar");
    }
  }

  checkPendingActions(editor, domEvt) {
    if (editor.plugins.get("PendingActions").hasAny) {
      domEvt.preventDefault();
      domEvt.returnValue = true;
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.boundRefreshDisplayMode);
    window.removeEventListener("beforeunload", this.boundCheckPendingActions);
  }
}
