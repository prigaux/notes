```toml
[dependencies]
mysql = "22"
```

```rs
use mysql::prelude::Queryable;

fn main() -> mysql::Result<()> {
    let opts = Opts::from_url("mysql://root:xxx@localhost/test")?;
    // or 
    let opts = mysql::OptsBuilder::new()
        //.ip_or_hostname(Some("localhost"))
        .db_name(Some("test"))
        .user(Some("root"))
        .pass(Some("xxx"));

    let mut conn = mysql::Conn::new(opts)?;

    // if you know the number of columns
    let val: Vec<(String, String)> = conn.query("select 1, 2")?;
    println!("{:?}", val);

    // if you do not know the number of columns
    let val: Vec<mysql::Row> = conn.query("select 1, 2")?;
    println!("{:?}", val);
    Ok(())
}
```
