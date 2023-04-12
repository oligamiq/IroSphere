#include <algorithm>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <string>

using namespace std;    // 汚染がひどいのであまりやってはいけない

string getImplStr(string str);
int    change_file(string file_name, string sign);
int    main(int argc, char* argv[]) {
  if (argc != 3) {
    cerr << "must be two args" << endl;
    return 1;
  }
  for (const filesystem::directory_entry& i : filesystem::recursive_directory_iterator(".")) {
    const string file_name = i.path( ).filename( ).string( );
    change_file(file_name, "tauri");
  }
}

int change_file(string file_name, string sign) {
  string   line;
  ifstream filein(file_name);    //File to read from
  if (!filein.is_open( )) {
    // cout << "Error opening files!" << endl;
    return 1;
  } else {
    string   tmp_file_name = file_name + ".tmp";
    ofstream fileout(tmp_file_name);    //Temporary file
    if (!fileout.is_open( )) {
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
      if (!filesystem::copy_file(tmp_file_name, file_name, filesystem::copy_options::update_existing)) {
        cerr << "cannot copy" << endl;
      }
      if (!filesystem::remove(tmp_file_name)) {
        cerr << "cannot remove" << endl;
      }
      filein.close( );
      fileout.close( );
    }
  }
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