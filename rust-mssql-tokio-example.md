Working example to connect to a SQL Server using [Tiberius](https://docs.rs/tiberius) with Tokio.

Cargo.toml
```toml
[dependencies]
tiberius = "x"
tokio = { version = "1", features = ["macros","net", "rt-multi-thread"] }
tokio-util = { version = "0.6", features = ["compat"] }
```

main.rs
```rs
use tokio::net::TcpStream;
use tokio_util::compat::TokioAsyncWriteCompatExt; // for compat_write()
use tiberius::{Client, Config, AuthMethod, EncryptionLevel, Result};

#[tokio::main]
async fn main() -> Result<()> {
    let mut client = {
        let mut config = Config::new();    
        config.host("mssqlhost");
        config.authentication(AuthMethod::sql_server("myuser", "mypasswd"));
        config.encryption(EncryptionLevel::NotSupported); // disable encryption completly
    
        let tcp = TcpStream::connect(config.get_addr()).await?;
        tcp.set_nodelay(true)?;
    
        Client::connect(config, tcp.compat_write()).await?
    };

    let results = {
        let stream = client.query("SELECT @P1", &[ &"foo" ]).await?;
        stream.into_results().await?
    };
    println!("{:?}", results);
    
    Ok(())
}
```
