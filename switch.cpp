// g++ switch.cpp -O3 -o switch.exe --std=c++2a

#include <algorithm>
#include <cstring>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>
using namespace std;    // 汚染がひどいのであまりやってはいけない

namespace fs = std::filesystem;

string            getImplStr(string str);
int               change_file(string file_name, string sign, bool commentOut);
int               file_copy_write(string fromPath, string toPath);
pair<int, string> count_leading_whitespace(const string& str);
int               change_files(string root_file_path, string target, const char option[]);

const vector<string> out_extensions = { ".ts", ".scss" };
const vector<string> gitignore      = { ".\\.git", ".\\.vscode", ".\\dist", ".\\docs", ".\\node_modules", ".\\src-tauri\\target" };

int main(int argc, char* argv[]) {
  if (!(4 <= argc && argc % 2 == 0)) {
    cerr << "./switch.exe <dir> <tauri | web...> <on | off> ..." << endl;
    return 1;
  }
  for (int i = 0; i < (argc - 2) / 2; i++)
    change_files(argv[1], argv[i * 2 + 2], argv[i * 2 + 3]);
}

int change_files(string root_file_path, string target, const char option[]) {
  vector<string> path_arr;
  fs::path       path_to_check(root_file_path);
  if (fs::exists(path_to_check)) {
    const bool commentOut = (!strcmp(option, "on")) ? true : false;
    if (fs::is_regular_file(path_to_check)) {
      change_file(root_file_path, target, commentOut);
      // std::cout << "Regular file" << std::endl;
    } else if (fs::is_directory(path_to_check)) {
      for (auto entry = fs::recursive_directory_iterator(root_file_path); entry != fs::recursive_directory_iterator( ); ++entry) {
        const string path = entry->path( ).string( );
        const string ext  = entry->path( ).extension( ).string( );
        if (entry->is_directory( )) {
          // cout << entry->path( ) << ":" << fs::canonical(entry->path( )) << endl;
          if (count(begin(gitignore), end(gitignore), entry->path( )) > 0)
            entry.disable_recursion_pending( );    // フォルダ内を探索しないようにする
          // for (auto item : gitignore) {
          //   const fs::path path = item;
          //   if (path.lexically_proximate(entry->path( )) != path)
          //     entry.disable_recursion_pending( );    // フォルダ内を探索しないようにする
          // }
        }
        if (entry->is_regular_file( ))
          // if (is_text(path))
          if (count(begin(out_extensions), end(out_extensions), ext) > 0)
            path_arr.push_back(path);
      }
      for (string item : path_arr) {
        change_file(item, target, commentOut);
        // cout << item << endl;
      }
      // std::cout << "Directory" << std::endl;
    } else {
      std::cout << "Unknown file type" << std::endl;
    }
  }
  return 0;
}

int change_file(string file_name, string sign, bool commentOut) {
  static vector<string> isOuted = { };
  string                line;
  ifstream              filein(file_name);    //File to read from
  if (!filein.is_open( )) {
    cout << "Error opening files!" << endl;
    return 1;
  } else {
    string   tmp_file_name = file_name + ".tmp";
    ofstream fileout(tmp_file_name);    //Temporary file
    if (fileout.is_open( )) {
      bool              isComment      = false;
      bool              isCommentStart = false;
      int               isCommentExist = 0;
      pair<int, string> slashBeforeSpaces;
      while (getline(filein, line)) {
        string line_impl = getImplStr(line);
        // cout << line_impl << ":" << sign << endl;
        if (line_impl == "// " + sign) {
          isComment      = true;
          isCommentStart = true;
          isCommentExist++;
          slashBeforeSpaces = count_leading_whitespace(line);
          fileout << line;
        } else if (line_impl == "// " + sign + " end") {
          isComment      = false;
          isCommentStart = false;
          fileout << line;
        } else if (isComment) {
          if (isCommentStart) {
            if (commentOut) {
              if (line_impl.substr(0, 2) != "//") {
                isComment = false;
                isCommentExist--;
              }
            } else {
              if (line_impl.substr(0, 2) == "//") {
                isComment = false;
                isCommentExist--;
              }
            }
            isCommentStart = false;
          }
          if (isComment)
            if (commentOut)
              fileout << slashBeforeSpaces.second + line.substr(slashBeforeSpaces.first + 3);
            else
              fileout << slashBeforeSpaces.second + "// " + line.substr(slashBeforeSpaces.first);
          else
            fileout << line;
        } else
          fileout << line;
        fileout << "\n";
      }
      filein.close( );
      fileout.close( );
      file_copy_write(tmp_file_name, file_name);
      fs::remove(tmp_file_name);
      if (isCommentExist > 0)
        if (count(begin(isOuted), end(isOuted), file_name) == 0) {
          isOuted.push_back(file_name);
          cout << file_name << endl;
        }
    }
  }
  return 0;
}

int file_copy_write(string fromPath, string toPath) {
  ifstream fromFile(fromPath, ios::binary);
  if (!fromFile.is_open( )) {
    cerr << "Failed to open the original file.\n";
    return 1;
  }
  ofstream toFile(toPath, ios::binary | ios::trunc);
  if (!toFile.is_open( )) {
    cerr << "Failed to create the copy file.\n";
    return 1;
  }
  const auto   fileSize   = fs::file_size(fromPath);
  const size_t bufferSize = 4096;
  char         buffer[bufferSize];
  size_t       remainingBytes = fileSize;
  while (remainingBytes > 0) {
    const size_t readBytes = min(bufferSize, remainingBytes);
    fromFile.read(buffer, readBytes);
    toFile.write(buffer, readBytes);
    remainingBytes -= readBytes;
  }
  fromFile.close( );
  toFile.close( );
  return 0;
}

bool isBothSpace(const char& lhs, const char& rhs) {
  return lhs == rhs && iswspace(lhs);
}

string getImplStr(string str) {
  if (!str.empty( )) {
    auto it = unique(str.begin( ), str.end( ), isBothSpace);
    str.erase(it, str.end( ));
    if (str[0] == ' ')
      str.erase(str.begin( ));
    if (str[str.size( ) - 1] == ' ')
      str.erase(str.size( ) - 1);
  }
  return str;
}

pair<int, string> count_leading_whitespace(const string& str) {
  int count = 0;
  for (const char& c : str)
    if (c == ' ')
      count++;
    else
      break;
  return { count, str.substr(0, count) };
}