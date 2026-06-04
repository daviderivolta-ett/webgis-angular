{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs
  ];

  shellHook = ''
    echo "Node.js dev shell attivata"
    node --version
    npm --version
  '';
}
