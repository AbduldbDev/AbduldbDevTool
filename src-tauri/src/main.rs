// Prevents an additional console window on Windows in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::Utc;
use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Serialize)]
struct SubFolder {
    name: String,
    path: String,
}

#[tauri::command]
fn open_in_vscode(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    let result = Command::new("cmd")
        .args(["/C", "code", &path])
        .creation_flags(CREATE_NO_WINDOW)
        .spawn();

    #[cfg(not(target_os = "windows"))]
    let result = Command::new("code").arg(&path).spawn();

    result
        .map(|_| ())
        .map_err(|e| format!("Failed to open VS Code: {e}"))
}

#[tauri::command]
fn delete_project_folder(path: String) -> Result<(), String> {
    fs::remove_dir_all(&path).map_err(|e| e.to_string())
}

/// Opens a terminal window rooted at `path`. Git commands work here as long as
/// Git is installed and available on PATH.
#[tauri::command]
fn open_git_cli(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use std::path::Path;

        let candidates = [
            r"C:\Program Files\Git\git-bash.exe",
            r"C:\Program Files (x86)\Git\git-bash.exe",
        ];

        let git_bash = candidates
            .iter()
            .find(|p| Path::new(p).exists())
            .ok_or_else(|| {
                "Git Bash not found. Checked Program Files and Program Files (x86).".to_string()
            })?;

        Command::new(git_bash)
            .current_dir(&path)
            .spawn()
            .map(|_| ())
            .map_err(|e| format!("Failed to open Git Bash: {e}"))
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .args(["-a", "Terminal", &path])
            .spawn()
            .map(|_| ())
            .map_err(|e| format!("Failed to open terminal: {e}"))
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("x-terminal-emulator")
            .arg("--working-directory")
            .arg(&path)
            .spawn()
            .map(|_| ())
            .map_err(|e| format!("Failed to open terminal: {e}"))
    }
}

/// Launches an arbitrary tool executable, optionally with a working directory.
#[tauri::command]
fn open_tool(exe_path: String, cwd: Option<String>) -> Result<(), String> {
    let mut cmd = Command::new(&exe_path);
    if let Some(dir) = cwd {
        cmd.current_dir(dir);
    }
    cmd.spawn()
        .map(|_| ())
        .map_err(|e| format!("Failed to launch tool: {e}"))
}

#[tauri::command]
fn open_in_explorer(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    let program = "explorer";
    #[cfg(target_os = "macos")]
    let program = "open";
    #[cfg(target_os = "linux")]
    let program = "xdg-open";

    let path = if cfg!(target_os = "windows") {
        path.replace('/', "\\")
    } else {
        path
    };

    Command::new(program)
        .arg(path)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn copy_image_to_folder(image_path: String, target_dir: String) -> Result<String, String> {
    fs::create_dir_all(&target_dir).map_err(|e| e.to_string())?;

    // Keep the original extension (fall back to png)
    let ext = PathBuf::from(&image_path)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .unwrap_or_else(|| "png".to_string());

    let filename = format!("project_{}.{}", Utc::now().timestamp_millis(), ext);
    let mut target_path = PathBuf::from(&target_dir);
    target_path.push(&filename);

    fs::copy(&image_path, &target_path).map_err(|e| e.to_string())?;

    Ok(target_path.to_str().ok_or("Invalid path")?.to_string())
}

#[tauri::command]
fn read_binary_file(path: String) -> Result<Vec<u8>, String> {
    fs::read(&path).map_err(|e| e.to_string())
}

/// Lists immediate subfolders of `root_path`, sorted by name.
#[tauri::command]
fn list_subfolders(root_path: String) -> Result<Vec<SubFolder>, String> {
    let mut folders: Vec<SubFolder> = fs::read_dir(&root_path)
        .map_err(|e| e.to_string())?
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.path().is_dir())
        .map(|entry| SubFolder {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
        })
        .collect();

    folders.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(folders)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            open_in_vscode,
            open_git_cli,
            open_tool,
            delete_project_folder,
            open_in_explorer,
            copy_image_to_folder,
            read_binary_file,
            list_subfolders
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}