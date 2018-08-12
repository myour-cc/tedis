import net from "net";
import { Options, Parameters } from "./global";
import { Protocol } from "./protocol";

type callback = (err: any, res: any) => void;

export interface InterfaceBase {
  command(...parameters: Parameters): Promise<any>;
  close(): void;
  // on(type: string, listener: () => void): void;
}
export class RedisBase implements InterfaceBase {
  private _socket: net.Socket;
  private _protocol: Protocol;
  private _callbacks: callback[];
  constructor(options: Options) {
    this._socket = net.createConnection(options);
    this._protocol = new Protocol();
    this._callbacks = [];
    this._socket.on("data", (buf) => {
      // console.log("socket data");
      this.data(buf);
    });
    // this._socket.on("timeout", () => {
    //   // console.log("socket timeout");
    //   this._socket.end();
    // });
    // this._socket.on("connect", () => {
    //   // console.log("socket connect");
    // });
    // this._socket.on("end", () => {
    //   // console.log("socket end");
    // });
    // this._socket.on("close", () => {
    //   // console.log("socket close");
    // });
  }
  // public on(type: string, listener: () => void) {
  //   //
  // }
  public close() {
    this._socket.end();
  }
  public command(...parameters: Parameters): Promise<any> {
    return new Promise((resolve, reject) => {
      this._callbacks.push((err: any, res: any) => {
        err ? reject(res) : resolve(res);
      });
      const str = this._protocol.encode(...parameters);
      this._socket.write(str);
    });
  }
  private data(data: Buffer) {
    this._protocol.write(data);

    while (true) {
      this._protocol.parse();
      if (!this._protocol.data.state) {
        break;
      }
      (this._callbacks.shift() as callback)(
        this._protocol.data.res.error,
        this._protocol.data.res.data
      );
    }
  }
}
