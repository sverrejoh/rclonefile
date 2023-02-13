#![deny(clippy::all)]

extern crate libc;
use errno::{errno, set_errno};
use libc::clonefile;
use napi::bindgen_prelude::AsyncTask;
use napi::{Env, Error, JsNumber, Result, Task};
use std::ffi::CString;

#[macro_use]
extern crate napi_derive;

#[napi(js_name = "cloneFileSync")]
pub fn clonefile_sync(src: String, dst: String) -> Result<i32> {
  let src = CString::new(src).unwrap();
  let dst = CString::new(dst).unwrap();
  let res = unsafe { clonefile(src.as_ptr(), dst.as_ptr(), 0) };

  if res == -1 {
    let e = errno();
    set_errno(e);
    let code = e.0;
    return Err(Error::from_reason(format!("{code} {e}")));
  } else {
    return Ok(res);
  }
}

pub struct AsyncClonefile {
  src: String,
  dst: String,
}

#[napi]
impl Task for AsyncClonefile {
  type Output = i32;
  type JsValue = JsNumber;

  fn compute(&mut self) -> Result<Self::Output> {
    let res = clonefile_sync(self.src.clone(), self.dst.clone());
    return res;
  }

  fn resolve(&mut self, env: Env, output: i32) -> Result<Self::JsValue> {
    env.create_int32(output)
  }
}

#[napi(js_name = "cloneFile")]
pub fn clonefile_task(src: String, dst: String) -> AsyncTask<AsyncClonefile> {
  AsyncTask::new(AsyncClonefile { src, dst })
}
