"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import Image from "next/image";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";

const SECTIONS = [
  ["files", "My Files", "pi pi-folder-open"],
  ["years", "Years", "pi pi-calendar"],
  ["recent", "Recent", "pi pi-clock"],
  ["starred", "Starred", "pi pi-star"],
  ["shared", "Shared", "pi pi-share-alt"],
  ["trash", "Trash", "pi pi-trash"],
];

const sizeLabel = (bytes = 0) => {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
};
const dateLabel = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
const iconFor = (item) => {
  if (item.type === "folder") return "pi pi-folder text-[#e5a400]";
  if (item.mimeType?.includes("pdf")) return "pi pi-file-pdf text-red-500";
  if (item.mimeType?.startsWith("image/")) return "pi pi-image text-purple-500";
  if (item.mimeType?.includes("sheet") || item.mimeType?.includes("excel"))
    return "pi pi-file-excel text-green-600";
  if (item.mimeType?.includes("word")) return "pi pi-file-word text-blue-600";
  return "pi pi-file text-[#64748b]";
};

export default function FileManager() {
  const toast = useRef(null);
  const fileInput = useRef(null);
  const folderInput = useRef(null);
  const [years, setYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [section, setSection] = useState("files");
  const [items, setItems] = useState([]);
  const [breadcrumbsByYear, setBreadcrumbsByYear] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [grid, setGrid] = useState(true);
  const [menuItem, setMenuItem] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [dialogValue, setDialogValue] = useState("");
  const [moveTarget, setMoveTarget] = useState({ yearId: "", parentId: "" });

  const selectedYear = years.find((year) => year._id === selectedYearId);
  const breadcrumbs = selectedYearId
    ? breadcrumbsByYear[selectedYearId] || []
    : [];
  const currentParentId = breadcrumbs.at(-1)?._id || "";
  const yearOptions = useMemo(
    () => [
      ...years
        .filter((year) => !year.isArchived)
        .map((year) => ({ label: year.name, value: year._id })),
      { label: "Other Files", value: "" },
    ],
    [years],
  );
  const folderOptions = useMemo(
    () => [
      { label: "Year root / Other Files", value: "" },
      ...items
        .filter((item) => item.type === "folder")
        .map((item) => ({ label: item.name, value: item._id })),
    ],
    [items],
  );

  const notify = (severity, summary, detail) =>
    toast.current?.show({ severity, summary, detail, life: 3000 });

  const copyToClipboard = async (value, label = "File path") => {
    if (!value) {
      notify("warn", "Path unavailable", "This item does not have a file path yet.");
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      notify("success", `${label} copied`, value);
    } catch {
      notify("error", "Unable to copy", "Please copy the path manually from Properties.");
    }
  };

  const toggleItemMenu = (item, event) => {
    if (!item) {
      setMenuItem(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setMenuItem({
      ...item,
      menuPosition: {
        top: rect.bottom + 4,
        left: Math.max(8, rect.right - 180),
      },
    });
  };

  const loadYears = useCallback(async () => {
    const response = await axios.get("/api/file-manager/years");
    const list = response.data.data || [];
    setYears(list);
    setSelectedYearId(
      (current) =>
        current ||
        list.find((year) => year.isCurrent)?._id ||
        list[0]?._id ||
        "",
    );
  }, []);

  const loadItems = useCallback(async () => {
    if (section === "years") return setItems([]);
    setLoading(true);
    try {
      const response = await axios.get("/api/file-manager/nodes", {
        params: {
          view: section === "files" ? "files" : section,
          yearId: selectedYearId,
          parentId: currentParentId,
          search,
          type: typeFilter,
          sortBy,
          sortOrder,
        },
      });
      setItems(response.data.data || []);
    } catch (error) {
      notify(
        "error",
        "Unable to load files",
        error.response?.data?.message || "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    section,
    selectedYearId,
    currentParentId,
    search,
    typeFilter,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    loadYears().catch(() =>
      notify("error", "Unable to load years", "Please refresh the page."),
    );
  }, [loadYears]);
  useEffect(() => {
    loadItems();
  }, [loadItems]);
  useEffect(() => {
    if (folderInput.current) {
      folderInput.current.setAttribute("webkitdirectory", "");
      folderInput.current.setAttribute("directory", "");
    }
  }, []);

  const chooseYear = (yearId) => {
    setSelectedYearId(yearId);
    setSection("files");
    setSearch("");
  };

  const openItem = (item) => {
    setMenuItem(null);
    if (item.type === "folder") {
      setBreadcrumbsByYear((current) => ({
        ...current,
        [selectedYearId]: [...breadcrumbs, item],
      }));
    } else if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  };

  const goToCrumb = (index) =>
    setBreadcrumbsByYear((current) => ({
      ...current,
      [selectedYearId]: index < 0 ? [] : breadcrumbs.slice(0, index + 1),
    }));

  const createFolder = async (parentId = currentParentId) => {
    if (!dialogValue.trim()) return;
    try {
      await axios.post("/api/file-manager/nodes", {
        name: dialogValue,
        type: "folder",
        yearId: selectedYearId || null,
        parentId: parentId || null,
      });
      setDialog(null);
      setDialogValue("");
      loadItems();
      notify("success", "Folder created", "Your new folder is ready.");
    } catch (error) {
      notify(
        "error",
        "Unable to create folder",
        error.response?.data?.message || "Please try again.",
      );
    }
  };

  const createYear = async () => {
    if (!dialogValue.trim()) return;
    try {
      const response = await axios.post("/api/file-manager/years", {
        name: dialogValue,
        isCurrent: years.length === 0,
      });
      setDialog(null);
      setDialogValue("");
      await loadYears();
      chooseYear(response.data.data._id);
      notify(
        "success",
        "Year created",
        "You can now create folders and upload files.",
      );
    } catch (error) {
      notify(
        "error",
        "Unable to create year",
        error.response?.data?.message || "Please try again.",
      );
    }
  };

  const getOrCreateUploadFolder = async (name, parentId) => {
    try {
      const response = await axios.post("/api/file-manager/nodes", {
        name,
        type: "folder",
        yearId: selectedYearId || null,
        parentId: parentId || null,
      });
      return response.data.data._id;
    } catch (error) {
      const response = await axios.get("/api/file-manager/nodes", {
        params: {
          view: "files",
          yearId: selectedYearId,
          parentId: parentId || "",
        },
      });
      const existing = (response.data.data || []).find(
        (item) => item.type === "folder" && item.name === name,
      );
      if (existing) return existing._id;
      throw error;
    }
  };

  const uploadFiles = async (fileList, preserveFolders = false) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (!selectedYearId && section === "files")
      notify(
        "info",
        "Uploading to Other Files",
        "These files will not be assigned to an academic year.",
      );
    setLoading(true);
    try {
      const folderCache = new Map();
      for (const file of files) {
        let uploadParentId = currentParentId || null;
        if (preserveFolders && file.webkitRelativePath) {
          const folders = file.webkitRelativePath
            .split("/")
            .slice(0, -1)
            .filter(Boolean);
          for (const folderName of folders) {
            const key = `${uploadParentId || "root"}/${folderName}`;
            if (!folderCache.has(key))
              folderCache.set(
                key,
                await getOrCreateUploadFolder(folderName, uploadParentId),
              );
            uploadParentId = folderCache.get(key);
          }
        }
        const data = new FormData();
        data.append("file", file);
        const uploaded = await axios.post("/api/upload", data);
        const url = uploaded.data?.result?.[0]?.url;
        if (!url) throw new Error(`Unable to upload ${file.name}`);
        await axios.post("/api/file-manager/nodes", {
          name: file.name,
          type: "file",
          yearId: selectedYearId || null,
          parentId: uploadParentId,
          size: file.size,
          mimeType: file.type,
          url,
        });
      }
      notify(
        "success",
        "Upload complete",
        `${files.length} file${files.length > 1 ? "s" : ""} added.`,
      );
      loadItems();
    } catch (error) {
      notify(
        "error",
        "Upload failed",
        error.response?.data?.message || error.message || "Please try again.",
      );
    } finally {
      setLoading(false);
      if (fileInput.current) fileInput.current.value = "";
      if (folderInput.current) folderInput.current.value = "";
    }
  };

  const patchItem = async (item, action, extra = {}) => {
    try {
      await axios.patch(`/api/file-manager/nodes/${item._id}`, {
        action,
        ...extra,
      });
      setMenuItem(null);
      setDialog(null);
      setDialogValue("");
      loadItems();
      notify(
        "success",
        action === "delete" ? "Moved to trash" : "Updated",
        action === "toggleStar" ? "Star status updated." : "Changes saved.",
      );
    } catch (error) {
      notify(
        "error",
        "Unable to update item",
        error.response?.data?.message || "Please try again.",
      );
    }
  };

  const deleteItem = (item) =>
    confirmDialog({
      header: `Delete ${item.type === "folder" ? "folder" : "file"}`,
      message: `Move “${item.name}” to Trash?${item.type === "folder" ? " All of its contents will also be moved." : ""}`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Move to Trash",
      rejectLabel: "Cancel",
      acceptClassName: "p-button-danger",
      accept: () =>
        axios
          .delete(`/api/file-manager/nodes/${item._id}`)
          .then(() => {
            loadItems();
            notify(
              "success",
              "Moved to Trash",
              "You can restore it from Trash.",
            );
          })
          .catch(() =>
            notify("error", "Unable to delete", "Please try again."),
          ),
    });

  const updateYear = async (year, action, name) => {
    try {
      await axios.patch(`/api/file-manager/years/${year._id}`, {
        action,
        name,
      });
      setDialog(null);
      setDialogValue("");
      await loadYears();
      notify(
        "success",
        "Year updated",
        action === "archive" ? "The year has been archived." : "Changes saved.",
      );
    } catch (error) {
      notify(
        "error",
        "Unable to update year",
        error.response?.data?.message || "Please try again.",
      );
    }
  };
  const deleteYear = (year) =>
    confirmDialog({
      header: "Delete year",
      message: `Delete “${year.name}” and all of its files and folders? This cannot be undone.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Delete year",
      rejectLabel: "Cancel",
      acceptClassName: "p-button-danger",
      accept: () =>
        axios
          .delete(`/api/file-manager/years/${year._id}`)
          .then(async () => {
            if (selectedYearId === year._id) setSelectedYearId("");
            await loadYears();
            notify(
              "success",
              "Year deleted",
              "Its stored content was deleted.",
            );
          })
          .catch(() =>
            notify("error", "Unable to delete year", "Please try again."),
          ),
    });

  const contextAction = (action, item) => {
    setMenuItem(null);
    if (action === "open") return openItem(item);
    if (action === "download")
      return window.open(item.url, "_blank", "noopener,noreferrer");
    if (action === "preview") return setDialog({ type: "preview", item });
    if (action === "properties") return setDialog({ type: "properties", item });
    if (action === "rename") {
      setDialogValue(item.name);
      return setDialog({ type: "rename", item });
    }
    if (action === "move" || action === "copy") {
      setMoveTarget({ yearId: selectedYearId, parentId: "" });
      return setDialog({ type: action, item });
    }
    if (action === "copyPath") return copyToClipboard(item.url || item.path);
    if (action === "share")
      return patchItem(item, "share").then(() =>
        copyToClipboard(item.url || item.path || window.location.href, "Share link"),
      );
    if (action === "star") return patchItem(item, "toggleStar");
    if (action === "delete") return deleteItem(item);
    if (action === "restore") return patchItem(item, "restore");
    if (action === "subfolder") {
      setDialogValue("");
      return setDialog({ type: "subfolder", item });
    }
    if (action === "upload") return fileInput.current?.click();
  };

  const yearName = selectedYear?.name || "Other Files";
  const isBrowse = section === "files";
  const dialogHeader =
    {
      year: "Create academic year",
      folder: "New folder",
      subfolder: "New subfolder",
      rename: "Rename item",
      move: "Move item",
      copy: "Copy item",
      preview: "Preview",
      properties: "Properties",
    }[dialog?.type] || "";

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f7f8fa] p-4 lg:p-6">
      <Toast ref={toast} />
      <ConfirmDialog />
      <input
        ref={fileInput}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => uploadFiles(event.target.files)}
      />
      <input
        ref={folderInput}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => uploadFiles(event.target.files, true)}
      />
      <div className="mx-auto flex  gap-4">
        <aside className="hidden w-56 shrink-0 rounded-xl border bg-white p-3 shadow-sm lg:block">
          <div className="mb-5 flex items-center gap-2 px-2 text-lg font-bold text-[#19212A]">
            <i className="pi pi-cloud text-primarycolor" /> File Manager
          </div>
          <nav className="space-y-1">
            {SECTIONS.map(([id, label, icon]) => (
              <button
                key={id}
                onClick={() => {
                  setSection(id);
                  setMenuItem(null);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${section === id ? "bg-[#fff1ef] font-semibold text-primarycolor" : "text-[#475569] hover:bg-slate-100"}`}
              >
                <i className={icon} />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-6 border-t pt-4">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Academic years
            </p>
            {years
              .filter((year) => !year.isArchived)
              .slice(0, 6)
              .map((year) => (
                <button
                  key={year._id}
                  onClick={() => chooseYear(year._id)}
                  className={`flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm ${selectedYearId === year._id && section === "files" ? "font-semibold text-primarycolor" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <i className="pi pi-folder text-[#e5a400]" />
                  {year.name}
                  {year.isCurrent && (
                    <i className="pi pi-check-circle ml-auto text-xs text-green-600" />
                  )}
                </button>
              ))}
          </div>
        </aside>
        <main className="min-w-0 flex-1 rounded-xl border bg-white shadow-sm">
          <div className="border-b px-4 py-4 lg:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="m-0 text-xl font-bold text-[#19212A]">
                  {section === "years"
                    ? "Academic Years"
                    : section === "files"
                      ? "My Files"
                      : SECTIONS.find(([id]) => id === section)?.[1]}
                </h1>
                {isBrowse && (
                  <div className="mt-2 flex flex-wrap items-center gap-1 text-sm text-slate-500">
                    <button
                      onClick={() => goToCrumb(-1)}
                      className="hover:text-primarycolor"
                    >
                      My Files
                    </button>
                    <span>›</span>
                    <button
                      onClick={() => goToCrumb(-1)}
                      className="hover:text-primarycolor"
                    >
                      {yearName}
                    </button>
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={crumb._id}>
                        <span>›</span>
                        <button
                          onClick={() => goToCrumb(index)}
                          className="hover:text-primarycolor"
                        >
                          {crumb.name}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Dropdown
                  value={selectedYearId}
                  options={yearOptions}
                  onChange={(event) => chooseYear(event.value)}
                  placeholder="Select year"
                  className="w-[180px]"
                />
                <Button
                  type="button"
                  label="New Folder"
                  icon="pi pi-folder-plus"
                  className="border border-[#af251c] bg-white px-[14px] py-[8px] text-primarycolor rounded-none font-medium
                      "
                  onClick={() => {
                    setDialogValue("");
                    setDialog({ type: "folder" });
                  }}
                  disabled={!isBrowse}
                />
                <Button
                  type="button"
                  label="Upload File"
                  icon="pi pi-upload"
                  className="border border-[#af251c] bg-primarycolor px-[14px] py-[8px] text-white rounded-none p-button-raised label:font-medium"
                  onClick={() => fileInput.current?.click()}
                  disabled={!isBrowse}
                />
                <Button
                  type="button"
                  label="Upload Folder"
                  icon="pi pi-upload"
                  className="border border-[#6C768B] bg-white px-[14px] py-[8px] text-[#19212A] rounded-none label:font-medium"
                  onClick={() => folderInput.current?.click()}
                  disabled={!isBrowse}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center">
              <IconField
                iconPosition="left"
                className="app-search-field flex-1"
              >
                <InputIcon className="pi pi-search" />
                <InputText
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search files and folders"
                  className="w-full app-search-input"
                />
              </IconField>
              <Dropdown
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.value)}
                options={[
                  { label: "All types", value: "" },
                  { label: "Folders", value: "folders" },
                  { label: "Files", value: "files" },
                ]}
                className="w-full md:w-36"
              />
              <Dropdown
                value={sortBy}
                onChange={(event) => setSortBy(event.value)}
                options={[
                  { label: "Sort: Name", value: "name" },
                  { label: "Sort: Date", value: "date" },
                  { label: "Sort: Size", value: "size" },
                ]}
                className="w-full md:w-40"
              />
              <Button
                type="button"
                icon={
                  sortOrder === "asc"
                    ? "pi pi-sort-amount-up"
                    : "pi pi-sort-amount-down"
                }
                outlined
                onClick={() =>
                  setSortOrder((value) => (value === "asc" ? "desc" : "asc"))
                }
              />
              <Button
                type="button"
                icon="pi pi-list"
                className={`h-[34px] w-[40px] rounded-none border ${!grid ? "border-[#af251c] bg-primarycolor text-white" : "border-[#6C768B] bg-white text-[#475569]"}`}
                onClick={() => setGrid(false)}
                aria-label="List view"
                title="List view"
              />
              <Button
                type="button"
                icon="pi pi-th-large"
                className={`h-[34px] w-[40px] rounded-none border ${grid ? "border-[#af251c] bg-primarycolor text-white" : "border-[#6C768B] bg-white text-[#475569]"}`}
                onClick={() => setGrid(true)}
                aria-label="Grid view"
                title="Grid view"
              />
            </div>
          </div>
          <div className="p-4 lg:p-6">
            {section === "years" ? (
              <div>
                <div className="mb-4 flex justify-end">
                  <Button
                    label="Create Year"
                    icon="pi pi-plus"
                    onClick={() => {
                      setDialogValue("");
                      setDialog({ type: "year" });
                    }}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {years.map((year) => (
                    <div
                      key={year._id}
                      className={`rounded-xl border p-4 ${year.isArchived ? "bg-slate-50 opacity-70" : "bg-white"}`}
                    >
                      <div className="flex items-start gap-3">
                        <i className="pi pi-calendar mt-1 text-2xl text-primarycolor" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-800">
                            {year.name}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {year.isArchived
                              ? "Archived"
                              : year.isCurrent
                                ? "Current year"
                                : "Active year"}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setMenuItem(
                              menuItem?._id === year._id
                                ? null
                                : { ...year, isYear: true },
                            )
                          }
                          className="rounded p-1 text-slate-500 hover:bg-slate-100"
                        >
                          <i className="pi pi-ellipsis-v" />
                        </button>
                      </div>
                      {menuItem?._id === year._id && menuItem.isYear && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t pt-3 text-xs">
                          <button
                            onClick={() => {
                              setDialogValue(year.name);
                              setDialog({ type: "renameYear", item: year });
                            }}
                            className="text-primarycolor"
                          >
                            Rename
                          </button>
                          <button
                            onClick={() => updateYear(year, "setCurrent")}
                            className="text-primarycolor"
                          >
                            Set current
                          </button>
                          <button
                            onClick={() =>
                              updateYear(
                                year,
                                year.isArchived ? "restore" : "archive",
                              )
                            }
                            className="text-primarycolor"
                          >
                            {year.isArchived ? "Restore" : "Archive"}
                          </button>
                          <button
                            onClick={() => deleteYear(year)}
                            className="text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : loading ? (
              <div className="flex h-60 items-center justify-center text-slate-400">
                <i className="pi pi-spin pi-spinner mr-2" /> Loading files…
              </div>
            ) : items.length === 0 ? (
              <div className="flex h-60 flex-col items-center justify-center text-center text-slate-500">
                <i className="pi pi-folder-open mb-3 text-5xl text-slate-300" />
                <p className="font-medium">No files or folders here</p>
                <p className="text-sm">
                  Create a folder or upload files to get started.
                </p>
              </div>
            ) : grid ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    onOpen={openItem}
                    onMenu={toggleItemMenu}
                    menuItem={menuItem}
                    onAction={contextAction}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="border-b text-xs uppercase text-slate-500">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Year</th>
                      <th className="p-3">Size</th>
                      <th className="p-3">Modified</th>
                      <th className="p-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item._id} className="border-b hover:bg-slate-50">
                        <td className="p-3">
                          <button
                            onClick={() => openItem(item)}
                            className="flex items-center gap-3 font-medium text-slate-700"
                          >
                            <i className={`${iconFor(item)} text-xl`} />
                            {item.name}
                            {item.isStarred && (
                              <i className="pi pi-star-fill text-xs text-amber-400" />
                            )}
                          </button>
                        </td>
                        <td className="p-3 text-slate-500">
                          {item.year || "Other Files"}
                        </td>
                        <td className="p-3 text-slate-500">
                          {item.type === "folder" ? "—" : sizeLabel(item.size)}
                        </td>
                        <td className="p-3 text-slate-500">
                          {dateLabel(item.updatedAt)}
                        </td>
                        <td className="p-3">
                          <MenuButton
                            item={item}
                            menuItem={menuItem}
                            onMenu={toggleItemMenu}
                            onAction={contextAction}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
      <Dialog
        header={dialogHeader}
        visible={Boolean(dialog)}
        onHide={() => setDialog(null)}
        className="w-[95vw] max-w-md"
        footer={
          dialog?.type === "preview" || dialog?.type === "properties" ? null : (
            <div className="flex justify-end gap-2">
              <Button
                label="Cancel"
                className="cancelbtn px-[14px] py-[10px] rounded-none"
                onClick={() => setDialog(null)}
              />
              <Button
                label={
                  dialog?.type === "move"
                    ? "Move"
                    : dialog?.type === "copy"
                      ? "Copy"
                      : "Save"
                }
                onClick={() => {
                  if (dialog?.type === "year") createYear();
                  else if (dialog?.type === "folder") createFolder();
                  else if (dialog?.type === "subfolder")
                    createFolder(dialog.item._id);
                  else if (dialog?.type === "rename")
                    patchItem(dialog.item, "rename", { name: dialogValue });
                  else if (dialog?.type === "renameYear")
                    updateYear(dialog.item, "rename", dialogValue);
                  else if (dialog?.type === "move" || dialog?.type === "copy") {
                    const targetYear = years.find(
                      (year) => year._id === moveTarget.yearId,
                    );
                    patchItem(dialog.item, dialog.type, {
                      parentId: moveTarget.parentId || null,
                      yearId: moveTarget.yearId || null,
                      year: targetYear?.name || "",
                    });
                  }
                }}
                className="border border-[#af251c] bg-primarycolor px-[14px] py-[10px] text-white rounded-none p-button-raised"
              />
            </div>
          )
        }
      >
        {(dialog?.type === "year" ||
          dialog?.type === "folder" ||
          dialog?.type === "subfolder" ||
          dialog?.type === "rename" ||
          dialog?.type === "renameYear") && (
          <InputText
            autoFocus
            value={dialogValue}
            onChange={(event) => setDialogValue(event.target.value)}
            placeholder={
              dialog?.type === "year" ? "e.g. 2026-27" : "Enter name"
            }
            className="w-full"
          />
        )}
        {(dialog?.type === "move" || dialog?.type === "copy") && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Choose a year and destination folder. You can navigate into a
              folder and use this action again to place an item deeper in the
              hierarchy.
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium">Year</label>
              <Dropdown
                value={moveTarget.yearId}
                options={yearOptions}
                onChange={(event) =>
                  setMoveTarget({ yearId: event.value, parentId: "" })
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Folder</label>
              <Dropdown
                value={moveTarget.parentId}
                options={folderOptions}
                onChange={(event) =>
                  setMoveTarget((target) => ({
                    ...target,
                    parentId: event.value,
                  }))
                }
                className="w-full"
              />
            </div>
          </div>
        )}
        {dialog?.type === "preview" && <Preview item={dialog.item} />}
        {dialog?.type === "properties" && <Properties item={dialog.item} />}
      </Dialog>
    </div>
  );
}

function ItemCard({ item, onOpen, onMenu, menuItem, onAction }) {
  return (
    <div className="group relative rounded-xl border bg-white p-4 transition hover:border-primarycolor hover:shadow-sm">
      <button
        onDoubleClick={() => onOpen(item)}
        onClick={() => item.type === "folder" && onOpen(item)}
        className="w-full text-left"
      >
        <div className="mb-5 flex items-center justify-between">
          <i className={`${iconFor(item)} text-4xl`} />
          {item.isStarred && <i className="pi pi-star-fill text-amber-400" />}
        </div>
        <div className="truncate font-medium text-slate-700" title={item.name}>
          {item.name}
        </div>
        <div className="mt-1 text-xs text-slate-400">
          {item.type === "folder"
            ? "Folder"
            : `${sizeLabel(item.size)} · ${dateLabel(item.updatedAt)}`}
        </div>
      </button>
      <div className="absolute right-2 top-2">
        <MenuButton
          item={item}
          menuItem={menuItem}
          onMenu={onMenu}
          onAction={onAction}
        />
      </div>
    </div>
  );
}

function MenuButton({ item, menuItem, onMenu, onAction }) {
  const isOpen = menuItem?._id === item._id && !menuItem.isYear;
  const actions = item.isTrashed
    ? [
        ["restore", "Restore", "pi pi-replay"],
        ["properties", "Properties", "pi pi-info-circle"],
      ]
    : [
        [
          "open",
          item.type === "folder" ? "Open" : "Open / Preview",
          "pi pi-folder-open",
        ],
        ...(item.type === "file"
          ? [
              ["download", "Download", "pi pi-download"],
              ["preview", "Preview", "pi pi-eye"],
              ["copyPath", "Copy file path", "pi pi-link"],
            ]
          : [
              ["subfolder", "Create subfolder", "pi pi-folder-plus"],
              ["upload", "Upload files", "pi pi-upload"],
            ]),
        ["rename", "Rename", "pi pi-pencil"],
        ["move", "Move", "pi pi-arrow-right-arrow-left"],
        ["copy", "Copy", "pi pi-copy"],
        ["share", "Share", "pi pi-share-alt"],
        ["star", item.isStarred ? "Remove star" : "Add star", "pi pi-star"],
        ["properties", "Properties", "pi pi-info-circle"],
        ["delete", "Delete", "pi pi-trash"],
      ];
  return (
    <div className="relative">
      <button
        onClick={(event) => {
          event.stopPropagation();
          onMenu(isOpen ? null : item, event);
        }}
        className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
      >
        <i className="pi pi-ellipsis-v" />
      </button>
      {isOpen && (
        <div
          className="fixed z-[1000] w-48 rounded-lg border border-[#d9dee8] bg-white py-1 shadow-xl"
          style={menuItem.menuPosition}
        >
          {actions.map(([key, label, icon]) => (
            <button
              key={key}
              onClick={(event) => {
                event.stopPropagation();
                onAction(key, item);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${key === "delete" ? "text-red-500" : "text-slate-700"}`}
            >
              <i className={`${icon} w-4`} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Preview({ item }) {
  if (item.mimeType?.startsWith("image/"))
    return (
      <Image
        src={item.url}
        alt={item.name}
        width={1200}
        height={900}
        unoptimized
        className="max-h-[65vh] w-full object-contain"
      />
    );
  if (item.mimeType?.includes("pdf"))
    return (
      <iframe
        title={item.name}
        src={item.url}
        className="h-[65vh] w-full border-0"
      />
    );
  return (
    <div className="py-10 text-center text-slate-500">
      <i className={`${iconFor(item)} mb-3 text-5xl`} />
      <p>Preview is not available for this file type.</p>
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="text-primarycolor underline"
      >
        Open file
      </a>
    </div>
  );
}

function Properties({ item }) {
  return (
    <dl className="grid grid-cols-[110px_1fr] gap-y-3 text-sm">
      <dt className="text-slate-500">Name</dt>
      <dd className="break-all font-medium">{item.name}</dd>
      <dt className="text-slate-500">Type</dt>
      <dd>{item.type === "folder" ? "Folder" : item.mimeType || "File"}</dd>
      <dt className="text-slate-500">Year</dt>
      <dd>{item.year || "Other Files"}</dd>
      <dt className="text-slate-500">Size</dt>
      <dd>{item.type === "folder" ? "—" : sizeLabel(item.size)}</dd>
      <dt className="text-slate-500">Modified</dt>
      <dd>{dateLabel(item.updatedAt)}</dd>
      <dt className="text-slate-500">Path</dt>
      <dd className="break-all">{item.path}</dd>
    </dl>
  );
}
