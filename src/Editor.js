/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Alignment from "@ckeditor/ckeditor5-alignment/src/alignment";
import Autoformat from "@ckeditor/ckeditor5-autoformat/src/autoformat";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import Strikethrough from "@ckeditor/ckeditor5-basic-styles/src/strikethrough";
import Underline from "@ckeditor/ckeditor5-basic-styles/src/underline";
import BlockQuote from "@ckeditor/ckeditor5-block-quote/src/blockquote";
import CKBoxPlugin from "@ckeditor/ckeditor5-ckbox/src/ckbox";
import CloudServices from "@ckeditor/ckeditor5-cloud-services/src/cloudservices";
import Comments from "@ckeditor/ckeditor5-comments/src/comments";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import FontFamily from "@ckeditor/ckeditor5-font/src/fontfamily";
import FontSize from "@ckeditor/ckeditor5-font/src/fontsize";
import Heading from "@ckeditor/ckeditor5-heading/src/heading";
import Highlight from "@ckeditor/ckeditor5-highlight/src/highlight";
import Image from "@ckeditor/ckeditor5-image/src/image";
import ImageCaption from "@ckeditor/ckeditor5-image/src/imagecaption";
import ImageResize from "@ckeditor/ckeditor5-image/src/imageresize";
import ImageStyle from "@ckeditor/ckeditor5-image/src/imagestyle";
import ImageToolbar from "@ckeditor/ckeditor5-image/src/imagetoolbar";
import ImageUpload from "@ckeditor/ckeditor5-image/src/imageupload";
import PictureEditing from "@ckeditor/ckeditor5-image/src/pictureediting";
import Link from "@ckeditor/ckeditor5-link/src/link";
import List from "@ckeditor/ckeditor5-list/src/list";
import MediaEmbed from "@ckeditor/ckeditor5-media-embed/src/mediaembed";
import PasteFromOffice from "@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import PresenceList from "@ckeditor/ckeditor5-real-time-collaboration/src/presencelist";
import RealTimeCollaborativeComments from "@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativecomments";
import RealTimeCollaborativeTrackChanges from "@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativetrackchanges";
import RemoveFormat from "@ckeditor/ckeditor5-remove-format/src/removeformat";
import Table from "@ckeditor/ckeditor5-table/src/table";
import TableToolbar from "@ckeditor/ckeditor5-table/src/tabletoolbar";
import TrackChanges from "@ckeditor/ckeditor5-track-changes/src/trackchanges";
import * as CKBox from "ckbox";
import "ckbox/dist/styles/ckbox.css";
import { Paragraph } from "ckeditor5/src/paragraph";
import format from "date-fns/format";
import ja from "date-fns/locale/ja";
import React, { Component } from "react";

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
              plugins: [Alignment, Autoformat, BlockQuote, Bold, CKBoxPlugin, PictureEditing, CloudServices, Comments, Essentials, FontFamily, FontSize, Heading, Highlight, Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar, ImageUpload, Italic, Link, List, MediaEmbed, Paragraph, PasteFromOffice, PresenceList, RealTimeCollaborativeComments, RealTimeCollaborativeTrackChanges, RemoveFormat, Strikethrough, Table, TableToolbar, TrackChanges, Underline],
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
                  extraPlugins: [Bold, Italic, Underline, List, Autoformat],
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
