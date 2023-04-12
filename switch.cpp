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
  if (argc != 3) {
    cerr << "must be two args" << endl;
    return 1;
  }
  vector<string> path_arr;
  for (const fs::directory_entry& i : fs::recursive_directory_iterator(argv[1]))
    path_arr.push_back(i.path( ).string( ));
  for (string item : path_arr) {
    change_file(item, argv[2]);
  }
}

int change_file(string file_name, string sign) {
  string   line;
  ifstream filein(file_name);    //File to read from
  if (!filein.is_open( )) {
    // cout << "Error opening files!" << endl;
    return 1;
  } else {
    string tmp_file_name = file_name + ".tmp";

    ofstream fileout(tmp_file_name);    //Temporary file
    if (fileout.is_open( )) {
      while (getline(filein, line)) {
        string line_impl = getImplStr(line);
        line             = line_impl;
        if (line_impl == sign) {
          //found = true;
        }
        line += "\n";
        fileout << line;
        //if(found) break;
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