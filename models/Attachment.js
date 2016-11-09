/* global Krypton, Class, CONFIG, AWS, S3Uploader */
const gm = require('gm').subClass({ imageMagick: true });

const Attachment = Class('Attachment').inherits(Krypton.Model)
  .includes(Krypton.Attachment)({
    tableName: 'Attachments',
    validations: {
      foreignKey: ['required'],
      type: ['required'],
    },
    attributes: ['id', 'type', 'foreignKey', 'filePath', 'fileMeta', 'createdAt', 'updatedAt'],
    attachmentStorage: new Krypton.AttachmentStorage.Local({
      acceptedMimeTypes: [/image/, /application/],
      maxFileSize: 10485760, // 10MB
    }),

    prototype: {
      type: null,
      foreignKey: null,

      init(config) {
        Krypton.Model.prototype.init.call(this, config);

        this.fileMeta = this.fileMeta || {};

        this.hasAttachment({
          name: 'file',
        });

        return this;
      },
    },
  });

module.exports = Attachment;