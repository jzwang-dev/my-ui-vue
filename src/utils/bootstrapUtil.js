import $ from 'jquery';

function onModalShow(event) {
  //console.log('show.bs.modal', event);

  const zIndex = 1050 + 20 * $('.modal:visible').length;
  $(event.target).css('z-index', zIndex);
  setTimeout(
    () =>
      $('.modal-backdrop')
        .not('.modal-stack')
        .css('z-index', zIndex - 10)
        .addClass('modal-stack'),
    0
  );
}

function onModalHidden(event) {
  //console.log('hidden.bs.modal', event);

  $('.modal:visible').length && $(document.body).addClass('modal-open');

  $(event.target).css('z-index', '');
}

function enableMultipleModals() {
  if (this?.$data == null) {
    console.log(
      '[warning] enableMultipleModals必須綁定Vue實體！ex: await enableMultipleModals.bind(this)()'
    );
    return;
  }

  this.$root.$on('show-bs-modal', onModalShow);
  this.$root.$on('hidden-bs-modal', onModalHidden);
}

export default {
  enableMultipleModals
};
