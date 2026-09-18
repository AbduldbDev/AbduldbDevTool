// Prevents an additional console window on Windows in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

/// Opens the given folder in VS Code, using the `code` CLI.
/// Requires the "code" command to be available on PATH
/// (VS Code -> Command Palette -> "Shell Command: Install 'code' command in PATH").
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

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            open_in_vscode,
            open_git_cli,
            open_tool
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
