/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { useState } from "react";
import Editor from "./Editor";
import ConfigurationDialog from "./InitialConfigurationDialog";
import { initialData } from "./sample-data";

const App = () => {
  const [configuration, setConfiguration] = useState(null);

  // Configuration data needed to initialize the editor is available only after the configuration dialog
  // is submitted, hence the editor is initialized after ConfigurationDialog returns the configuration.
  if (!configuration) {
    return <ConfigurationDialog onSubmit={(newConfiguration) => setConfiguration(newConfiguration)} />;
  }

  return <Editor configuration={configuration} initialData={initialData} />;
};

export default App;
