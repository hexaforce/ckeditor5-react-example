/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { Component } from "react";
import Editor from "./Editor";
import ConfigurationDialog from "./InitialConfigurationDialog";
import { initialData } from "./sample-data";

export default class App extends Component {
  state = {
    configuration: null,
  };

  render() {
    // Configuration data needed to initialize the editor is available only after the configuration dialog
    // is submitted, hence the editor is initialized after ConfigurationDialog returns the configuration.
    if (!this.state.configuration) {
      return <ConfigurationDialog onSubmit={(configuration) => this.setState({ configuration })} />;
    }

    return <Editor configuration={this.state.configuration} initialData={initialData} />;
  }
}
