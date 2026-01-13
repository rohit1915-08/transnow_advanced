"use client";

import Spline from "@splinetool/react-spline";

export default function WorldBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Spline scene="https://prod.spline.design/xDflc5cSJT2GcZFd/scene.splinecode" />
    </div>
  );
}
