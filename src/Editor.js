/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { useEffect, useRef, useState } from "react";

import { ClassicEditor } from "@ckeditor/ckeditor5-editor-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";

import * as CKBox from "ckbox";
import "ckbox/dist/styles/ckbox.css";

import format from "date-fns/format";
import ja from "date-fns/locale/ja";

import { commentEditorPlugins, plugins } from "./config-default";

const Editor = (props) => {
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const sidebarElementRef = useRef(null);
  const presenceListElementRef = useRef(null);

  useEffect(() => {
    window.CKBox = CKBox;
    setIsLayoutReady(true);

    return () => {
      window.removeEventListener("resize", refreshDisplayMode);
      window.removeEventListener("beforeunload", checkPendingActions);
    };
  }, []);

  const refreshDisplayMode = () => {
    const annotationsUIs = editor.plugins.get("AnnotationsUIs");
    const sidebarElement = sidebarElementRef.current;

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
  };

  const checkPendingActions = (domEvt) => {
    if (editor.plugins.get("PendingActions").hasAny) {
      domEvt.preventDefault();
      domEvt.returnValue = true;
    }
  };

  const editorConfig = {
    plugins: plugins,
    toolbar: ["heading", "|", "fontsize", "fontfamily", "|", "bold", "italic", "underline", "strikethrough", "removeFormat", "highlight", "|", "alignment", "|", "numberedList", "bulletedList", "|", "undo", "redo", "|", "comment", "commentsArchive", "trackChanges", "|", "ckbox", "imageUpload", "link", "blockquote", "insertTable", "mediaEmbed"],
    cloudServices: {
      tokenUrl: props.configuration.tokenUrl,
      webSocketUrl: props.configuration.webSocketUrl,
    },
    collaboration: {
      channelId: props.configuration.channelId,
    },
    ckbox: {
      tokenUrl: props.configuration.ckboxTokenUrl || props.configuration.tokenUrl,
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
      container: sidebarElementRef.current,
    },
    presenceList: {
      container: presenceListElementRef.current,
    },
    comments: {
      editorConfig: {
        extraPlugins: commentEditorPlugins,
      },
      formatDateTime: (date) => format(date, "yyyy/MM/dd", { locale: ja }),
    },
  };

  return (
    <div className="App">
      <main>
        <div className="centered">
          <div className="row-presence">
            <div ref={presenceListElementRef} className="presence"></div>
          </div>
          {isLayoutReady && (
            <div className="row row-editor">
              <CKEditor
                onReady={(editor) => {
                  console.log("Editor is ready to use!", editor);
                  window.addEventListener("resize", refreshDisplayMode);
                  window.addEventListener("beforeunload", checkPendingActions);
                  refreshDisplayMode();
                }}
                onChange={(event, editor) => console.log({ event, editor })}
                editor={ClassicEditor}
                data={props.initialData}
                config={editorConfig}
              />
              <div ref={sidebarElementRef} className="sidebar"></div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Editor;
