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

int main(int argc, char* argv[]) {
  const vector<string> out_extensions = { ".ts", ".scss" };
  if (argc != 4) {
    cerr << "./switch.exe <dir> <tauri | web> <on | off>" << endl;
    return 1;
  }
  vector<string> path_arr;
  for (const fs::directory_entry& i : fs::recursive_directory_iterator(argv[1])) {
    const string path = i.path( ).string( );
    const string ext  = i.path( ).extension( ).string( );
    if (i.is_regular_file( ))
      // if (is_text(path))
      if (count(begin(out_extensions), end(out_extensions), ext) > 0)
        path_arr.push_back(path);
  }
  const bool commentOut = (!strcmp(argv[3], "on")) ? true : false;
  for (string item : path_arr) {
    change_file(item, argv[2], commentOut);
    cout << item << endl;
  }
}

int change_file(string file_name, string sign, bool commentOut) {
  string   line;
  ifstream filein(file_name);    //File to read from
  if (!filein.is_open( )) {
    cout << "Error opening files!" << endl;
    return 1;
  } else {
    string   tmp_file_name = file_name + ".tmp";
    ofstream fileout(tmp_file_name);    //Temporary file
    if (fileout.is_open( )) {
      bool              isComment = false;
      pair<int, string> slashBeforeSpaces;
      while (getline(filein, line)) {
        string line_impl = getImplStr(line);
        // cout << line_impl << ":" << sign << endl;
        if (line_impl == "// " + sign) {
          isComment         = true;
          slashBeforeSpaces = count_leading_whitespace(line);
          fileout << line;
        } else if (line_impl == "// " + sign + " end") {
          isComment = false;
          fileout << line;
        } else if (isComment) {
          if (commentOut)
            fileout << slashBeforeSpaces.second + line.substr(slashBeforeSpaces.first + 3);
          else {
            fileout << slashBeforeSpaces.second + "// " + line.substr(slashBeforeSpaces.first);
          }
        } else
          fileout << line;
        fileout << "\n";
      }
      filein.close( );
      fileout.close( );
      file_copy_write(tmp_file_name, file_name);
      fs::remove(tmp_file_name);
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