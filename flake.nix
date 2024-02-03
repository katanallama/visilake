{
  description = "Nardo Web project with T3 and rust stack deployed to localstack";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    localstack.url = "github:nardoring/localstack-nix";
    # rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs = {
    self,
    nixpkgs,
    localstack,
    # rust-overlay,
    ...
  }: let
    system = "x86_64-linux";
    pkgs = import nixpkgs {
      inherit system;
      config.allowUnfree = true;
      # overlays = [rust-overlay.overlays.default];
    };

    nardo = pkgs.buildNpmPackage {
      # https://create.t3.gg/en/deployment/docker
      pname = "nardo-web";
      version = "0.1.0";
      src = ./.;
      # npmDepsHash = "sha256-wLnTg1BLf1AKN+G/lmZ9/Mf3ZeIsm7zcE4+SsH5dwwU=";
      npmDepsHash = "sha256-9x2s2mD5SMTmBfzdTEP9CcC7tUnc4Jm2Rz8bLGs6rrs=";

      npmBuild = "SKIP_ENV_VALIDATION=1 npm run build";

      npmPackFlags = ["--ignore-scripts"];

      installPhase = ''
        mkdir -p $out/app

        cp -r .next $out/app/.next
        cp -r .next/standalone/* $out/app/
        cp -r .next/static $out/app/.next/static
        cp -r public $out/app/public

        cp package.json $out/app/
        cp next.config.mjs $out/app/
      '';
    };

    localstackpro-image = pkgs.dockerTools.pullImage {
      imageName = "localstack/localstack-pro";
      imageDigest = "sha256:b6bb4d7b1209b47daccd2d58e669b0fb19ace3ecd98572ec6e3e75921768f6f6";
      sha256 = "sha256-oJlIFsIRtvZSLtABjapc+ZJeJUcDi+xhct/H3o/5pck=";
      finalImageName = "localstack/localstack-pro";
      finalImageTag = "latest";
    };

    nardo-image = pkgs.dockerTools.buildImage {
      name = "nardo";
      tag = "latest";

      copyToRoot = pkgs.buildEnv {
        name = "nardo";
        paths = [
          nardo
          pkgs.nodejs
        ];
        pathsToLink = ["/bin /app"];
      };

      runAsRoot = ''
        #!${pkgs.runtimeShell}
        ${pkgs.dockerTools.shadowSetup}
        groupadd --system --gid 1001 nodejs
        useradd --system --uid 1001 --gid nodejs nextjs
      '';

      config = {
        Cmd = ["${pkgs.nodejs}/bin/node" "server.js"];
        ExposedPorts = {
          "3000/tcp" = {};
        };
        Env = [
          # add other environment variables
          "NODE_ENV=production"
          "NEXT_TELEMETRY_DISABLED=1"
        ];
        WorkingDir = "/app";
        User = "nextjs";
      };
    };
    #
    #
  in {
    devShells.${system}.default = pkgs.mkShell {
      buildInputs =
        [
          ## rust
          # toolchain
          # pkgs.rust-analyzer-unwrapped

          ## web
          pkgs.nodejs
          pkgs.nodePackages.prettier
          pkgs.nodePackages.eslint

          ## AWS
          pkgs.awscli
          pkgs.terraform
          # pkgs.localstack # broken on nixpkgs
        ]
        ++ localstack.devShells.${system}.default.buildInputs;

      # RUST_SRC_PATH = "${toolchain}/lib/rustlib/src/rust/library";

      # Localstack/AWS env vars
      LOCALSTACK_API_KEY = "4CVxMCDrKZ";
      LOCALSTACK = "true";
      DEBUG = "1";
      AWS_ACCESS_KEY_ID = "test";
      AWS_SECRET_ACCESS_KEY = "test";
      AWS_DEFAULT_REGION = "us-east-1";
    };

    packages.${system} = {
      nardo = nardo;
      nardo-image = nardo-image;
      localstackpro-image = localstackpro-image;
    };
  };
}
