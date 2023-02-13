#![deny(clippy::all)]

extern crate libc;
use errno::{errno, set_errno};
use libc::clonefile;
use napi::bindgen_prelude::AsyncTask;
use napi::{Env, Error, JsNumber, Result, Task};
use std::ffi::CString;

#[macro_use]
extern crate napi_derive;

#[napi(object)]
#[derive(Default, Clone, Debug)]
pub struct CloneFileOptions {
  pub no_follow: Option<bool>,
  pub no_owner_copy: Option<bool>,
  pub clone_acl: Option<bool>,
}

const CLONE_NOFOLLOW: u32 = 1 << 0;
const CLONE_NOOWNERCOPY: u32 = 1 << 1;
const CLONE_ACL: u32 = 1 << 2;

fn flags_from_options(options: Option<CloneFileOptions>) -> u32 {
  match options {
    None => 0,
    Some(options) => {
      let CloneFileOptions {
        no_follow,
        no_owner_copy,
        clone_acl,
      } = options;

      let flags = no_follow
        .unwrap_or(false)
        .then_some(CLONE_NOFOLLOW)
        .unwrap_or(0)
        | no_owner_copy
          .unwrap_or(false)
          .then_some(CLONE_NOOWNERCOPY)
          .unwrap_or(0)
        | clone_acl.unwrap_or(false).then_some(CLONE_ACL).unwrap_or(0);

      flags
    }
  }
}

#[napi(js_name = "cloneFileSync")]
pub fn clonefile_sync(src: String, dst: String, options: Option<CloneFileOptions>) -> Result<i32> {
  let src = CString::new(src)?;
  let dst = CString::new(dst)?;
  let flags = flags_from_options(options);

  let res = unsafe { clonefile(src.as_ptr(), dst.as_ptr(), flags) };

  if res == -1 {
    let e = errno();
    set_errno(e);
    return Err(Error::from_reason(format!("{e}")));
  } else {
    return Ok(res);
  }
}

pub struct AsyncClonefile {
  src: String,
  dst: String,
  options: Option<CloneFileOptions>,
}

#[napi]
impl Task for AsyncClonefile {
  type Output = i32;
  type JsValue = JsNumber;

  fn compute(&mut self) -> Result<Self::Output> {
    clonefile_sync(self.src.clone(), self.dst.clone(), self.options.clone())
  }

  fn resolve(&mut self, env: Env, output: i32) -> Result<Self::JsValue> {
    env.create_int32(output)
  }
}

#[napi(js_name = "cloneFile")]
pub fn clonefile_task(
  src: String,
  dst: String,
  options: Option<CloneFileOptions>,
) -> AsyncTask<AsyncClonefile> {
  AsyncTask::new(AsyncClonefile { src, dst, options })
}
