# ipfs.casa 🏠

[**ipfs.casa**](https://ipfs.casa) is a simple static web app which serves to provide a [Netlify](https://www.netlify.com/)-like developer experience for simple, free static site hosting _on the distributed web_.

<img width="1032" alt="ipfs.casa homepage" src="https://user-images.githubusercontent.com/1779930/76175972-57cfc400-6185-11ea-9bc1-1ad4f6130992.png">

**ipfs.casa** builds upon [IPFS](https://ipfs.io), a distributed system for storing and accessing files, websites, applications, and data. Files are uploaded to [Infura](https://infura.io/), a pinning service that ensures your files will be permanently available.

**ipfs.casa** is itself uploaded using **ipfs.casa**, using [Cloudflare](https://www.cloudflare.com/distributed-web-gateway/) as an IPFS gateway. You can find the hash of the current version of the website by running `dig _dnslink.ipfs.casa TXT` in your terminal.

Keep in mind that anything uploaded using **ipfs.casa** will be publicly and permanently available, or at least as long as [Infura](https://infura.io/) guarantees to retain anonymously uploaded data. As such, you should be wary to avoid uploading any secret credentials or other private data. By default, hidden files and folders will be excluded from the upload. See the [IPFS Pinning documentation](https://docs.ipfs.io/guides/concepts/pinning/) for more information about data persistence.

## License

Copyright 2020 Andrew Duthie

Released under the MIT License. See [LICENSE.md](./LICENSE.md).
