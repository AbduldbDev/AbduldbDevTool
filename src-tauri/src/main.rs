// Prevents an additional console window on Windows in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::fs;
use std::process::Command;
#[tauri::command]
fn open_in_vscode(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    let result = Command::new("cmd").args(["/C", "code", &path]).spawn();

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
            .current_dir(&path)   // set cwd directly, don't rely on --cd
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

    std::process::Command::new(program)
        .arg(path)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            open_in_vscode,
            open_git_cli,
            open_tool,
            delete_project_folder,
            open_in_explorer 
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
