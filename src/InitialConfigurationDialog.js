/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { useState } from "react";
import "./InitialConfigurationDialog.css";
import { randomString, users } from "./sample-data";

const LOCAL_STORAGE_KEY = "CKEDITOR_CS_CONFIG";

const ConfigurationPage = (props) => {
  const [config, setConfig] = useState(getStoredConfig());
  const [channelId] = useState(handleChannelIdInUrl());
  const [selectedUser, setSelectedUser] = useState(null);
  const [isWarning, setIsWarning] = useState(false);

  const handleConfigChange = (value, property) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      [property]: value,
    }));
  };

  const handleTokenUrlChange = (value) => {
    handleConfigChange(value, "tokenUrl");
    setSelectedUser(null);
    setIsWarning(false);
  };

  const selectUser = (data) => {
    setSelectedUser(data.id);
    setIsWarning(false);

    const updatedConfig = {
      ...config,
      tokenUrl: `${getRawTokenUrl(config.tokenUrl)}?${Object.keys(data)
        .filter((key) => data[key])
        .map((key) => (key === "role" ? `${key}=${data[key]}` : `user.${key}=${data[key]}`))
        .join("&")}`,
    };

    setConfig(updatedConfig);
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();

    if (isCloudServicesTokenEndpoint(config.tokenUrl) && !config.tokenUrl.includes("?")) {
      setIsWarning(true);
      return;
    }

    storeConfig({ ...config, tokenUrl: getRawTokenUrl(config.tokenUrl) });
    updateDChannelIdInUrl(channelId);
    props.onSubmit({ ...config, channelId });
  };

  return (
    <div id="overlay" className={isWarning ? " warning" : ""}>
      <form className="body" onSubmit={handleSubmit}>
        <h2>Connect CKEditor Cloud Services</h2>
        <p>
          If you do not have Cloud Services URLs yet,&nbsp;
          <a href="https://ckeditor.com/docs/cs/latest/guides/collaboration/quick-start.html" target="_blank" rel="noopener noreferrer">
            see the documentation
          </a>
          .
        </p>
        <div>
          <label htmlFor="web-socket-url">WebSocket URL</label>
          <input name="web-socket-url" onChange={(evt) => handleConfigChange(evt.target.value, "webSocketUrl")} value={config.webSocketUrl} />
        </div>
        <div>
          <label htmlFor="token-url">Token URL</label>
          <input required name="token-url" onChange={(evt) => handleTokenUrlChange(evt.target.value)} value={config.tokenUrl} />
        </div>
        <div id="additional" className={isCloudServicesTokenEndpoint(config.tokenUrl) ? "visible" : ""}>
          <p>Use one of the following users to define the user data.</p>
          <div id="user-container">
            {users.map((data) => (
              <div key={data.id} onClick={() => selectUser(data)} className={selectedUser === data.id ? "active" : ""}>
                {data.avatar && <img src={data.avatar} />}
                {!data.avatar && data.name && <span className="pseudo-avatar">{getUserInitials(data.name)}</span>}
                {!data.avatar && !data.name && <span className="pseudo-avatar anonymous"></span>}
                {data.name || "(anonymous)"}
                <span className="role">{data.role}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="ckbox-token-url">CKBox token URL (optional)</label>
          <input name="ckbox-token-url" onChange={(evt) => handleConfigChange(evt.target.value, "ckboxTokenUrl")} value={config.ckboxTokenUrl} />
        </div>
        <div>
          <label htmlFor="channel-id">Channel ID</label>
          <input name="channel-id" required defaultValue={channelId} />
        </div>
        <button id="start">Start</button>
      </form>
    </div>
  );
};

function getUserInitials(name) {
  return name
    .split(" ", 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function handleChannelIdInUrl() {
  let id = getChannelIdFromUrl();

  if (!id) {
    id = randomString();
    updateDChannelIdInUrl(id);
  }

  return id;
}

function updateDChannelIdInUrl(id) {
  window.history.replaceState({}, document.title, generateUrlWithChannelId(id));
}

function generateUrlWithChannelId(id) {
  return `${window.location.href.split("?")[0]}?channelId=${id}`;
}

function getChannelIdFromUrl() {
  const channelIdMatch = location.search.match(/channelId=(.+)$/);

  return channelIdMatch ? decodeURIComponent(channelIdMatch[1]) : null;
}

function isCloudServicesTokenEndpoint(tokenUrl) {
  return /cke-cs[\w-]*\.com\/token\/dev/.test(tokenUrl);
}

function getRawTokenUrl(url) {
  if (isCloudServicesTokenEndpoint(url)) {
    return url.split("?")[0];
  }

  return url;
}

function storeConfig(csConfig) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(csConfig));
}

function getStoredConfig() {
  const config = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");

  return {
    tokenUrl: config.tokenUrl || "",
    ckboxTokenUrl: config.ckboxTokenUrl || "",
    webSocketUrl: config.webSocketUrl || "",
  };
}

export default ConfigurationPage;
