#include <algorithm>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>
using namespace std;    // 汚染がひどいのであまりやってはいけない

namespace fs = std::filesystem;

string getImplStr(string str);
int    change_file(string file_name, string sign);
int    file_copy_write(string fromPath, string toPath);

int main(int argc, char* argv[]) {
  if (argc != 4) {
    cerr << "./switch.exe <dir> <tauri | web> <on | off>" << endl;
    return 1;
  }
  vector<string> path_arr;
  for (const fs::directory_entry& i : fs::recursive_directory_iterator(argv[1])) {
    path_arr.push_back(i.path( ).string( ));
  }
  const bool commentOut = (argv[3] == "on") ? true : false;
  for (string item : path_arr) {
    // change_file(item, argv[2], commentOut);
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
      bool isComment = false;
      while (getline(filein, line)) {
        string line_impl = getImplStr(line);
        if (line_impl == sign)
          isComment = true;
        else if (line_impl == sign + " end")
          isComment = false;
        else if (isComment)
          if (commentOut)
            fileout << "// " + line;
          else { }
        else
          fileout << line + "\n";
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
  std::ifstream fromFile(fromPath, std::ios::binary);
  if (!fromFile.is_open( )) {
    std::cerr << "Failed to open the original file.\n";
    return 1;
  }
  std::ofstream toFile(toPath, std::ios::binary | std::ios::trunc);
  if (!toFile.is_open( )) {
    std::cerr << "Failed to create the copy file.\n";
    return 1;
  }
  const auto        fileSize   = fs::file_size(fromPath);
  const std::size_t bufferSize = 4096;
  char              buffer[bufferSize];
  std::size_t       remainingBytes = fileSize;
  while (remainingBytes > 0) {
    const std::size_t readBytes = std::min(bufferSize, remainingBytes);
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
    auto it = std::unique(str.begin( ), str.end( ), isBothSpace);
    str.erase(it, str.end( ));
    if (str[0] == ' ')
      str.erase(str.begin( ));
    if (str[str.size( ) - 1] == ' ')
      str.erase(str.size( ) - 1);
  }
  return str;
}