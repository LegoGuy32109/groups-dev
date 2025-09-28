export default function RefreshButton() {
  <div class="fixed left-2 top-2 z-50">
    <button
      type="reset"
      onClick={globalThis.location.reload}
    />
  </div>;
}
